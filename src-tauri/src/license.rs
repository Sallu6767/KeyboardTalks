use serde::{Deserialize, Serialize};
use crate::config;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use base64::{engine::general_purpose::STANDARD, Engine};

type HmacSha256 = Hmac<Sha256>;

const LICENSE_SECRET: &[u8] = env!("LICENSE_SECRET").as_bytes();

const ACTIVATE_URL: &str = "https://api.freemius.com/v1/products/39189/licenses/activate.json";

#[derive(Serialize)]
struct ActivateRequest {
    uid: String,
    license_key: String,
    url: String,
    title: String,
    version: String,
    is_marketing_allowed: bool,
}

#[derive(Deserialize, Debug)]
struct FreemiusError {
    code: Option<String>,
    message: Option<String>,
}

#[derive(Deserialize, Debug)]
struct FreemiusResponse {
    #[serde(default)]
    user_id: Option<serde_json::Value>,
    #[serde(default)]
    license_plan_name: Option<String>,
    #[serde(default)]
    license_plan_id: Option<serde_json::Value>,
    #[serde(default)]
    install_id: Option<serde_json::Value>,
    #[serde(default)]
    install_secret_key: Option<String>,
    #[serde(default)]
    install_public_key: Option<String>,
    #[serde(default)]
    install_api_token: Option<String>,
    #[serde(default)]
    error: Option<FreemiusError>,
}

#[derive(Debug, Clone, Serialize)]
pub struct LicenseResult {
    pub valid: bool,
    pub message: String,
}

fn sign_license(instance_id: &str, license_key: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(LICENSE_SECRET)
        .expect("valid key");
    mac.update(format!("{}:{}", instance_id, license_key).as_bytes());
    STANDARD.encode(mac.finalize().into_bytes())
}

fn signature_valid(instance_id: &str, license_key: &str, signature: &str) -> bool {
    sign_license(instance_id, license_key) == signature
}

pub fn is_pro() -> bool {
    let cfg = config::get();
    if !cfg.is_pro {
        return false;
    }
    match (&cfg.license_key, &cfg.license_signature) {
        (Some(key), Some(sig)) => signature_valid(&cfg.instance_id, key, sig),
        _ => false,
    }
}

pub fn verify_and_heal() {
    let cfg = config::get();
    if cfg.is_pro && !is_pro() {
        config::update(|c| {
            c.is_pro = false;
            c.license_key = None;
            c.license_signature = None;
        });
        println!("[License] Invalid/tampered license detected, reset to free tier");
    }
}

pub async fn validate_key(license_key: &str) -> LicenseResult {
    let key = license_key.trim().to_string();

    if key.is_empty() {
        return LicenseResult {
            valid: false,
            message: "Please enter a license key.".to_string(),
        };
    }

    if is_pro() && config::get().license_key.as_deref() == Some(&key) {
        return LicenseResult {
            valid: true,
            message: "Pro Pass is already active on this device.".to_string(),
        };
    }

    let local_machine_id = config::get().instance_id.clone();

    let mut attempt = 0;
    let max_attempts = 3;
    let mut last_error = String::new();

    while attempt < max_attempts {
        if attempt > 0 {
            let delay_ms = 500 * (2u64).pow(attempt as u32 - 1);
            tokio::time::sleep(tokio::time::Duration::from_millis(delay_ms)).await;
        }

        match activate_license(&key, &local_machine_id).await {
            Ok(response) => {
                let user_id_present = response
                    .user_id
                    .as_ref()
                    .map(|v| !v.is_null())
                    .unwrap_or(false);

                if user_id_present && response.error.is_none() {
                    save_pro_status(&key);
                    return LicenseResult {
                        valid: true,
                        message: "Pro Pass activated! Enjoy custom sounds.".to_string(),
                    };
                }

                if let Some(err) = &response.error {
                    let code = err.code.as_deref().unwrap_or("");
                    let message = err.message.as_deref().unwrap_or("Activation failed.");

                    match code {
                        "invalid_license_key" | "license_not_found" => {
                            return LicenseResult {
                                valid: false,
                                message: "Invalid license key. Please check the key in your receipt email.".to_string(),
                            };
                        }
                        "license_quota_exceeded" | "license_already_activated_for_other_user" => {
                            return LicenseResult {
                                valid: false,
                                message: "Activation limit reached. Please deactivate an old device first by logging into freemius.com as a buyer with the same email.".to_string(),
                            };
                        }
                        "license_already_activated" | "license_activated" => {
                            save_pro_status(&key);
                            return LicenseResult {
                                valid: true,
                                message: "Pro Pass verified for this device!".to_string(),
                            };
                        }
                        _ => {
                            return LicenseResult {
                                valid: false,
                                message: message.to_string(),
                            };
                        }
                    }
                }

                return LicenseResult {
                    valid: false,
                    message: "Activation failed. Please try again.".to_string(),
                };
            }

            Err(e) => {
                last_error = e.to_string();
                attempt += 1;
                if attempt >= max_attempts {
                    break;
                }
            }
        }
    }

    if is_pro() && config::get().license_key.as_deref() == Some(&key) {
        return LicenseResult {
            valid: true,
            message: "Pro Pass active (verified offline).".to_string(),
        };
    }

    LicenseResult {
        valid: false,
        message: format!(
            "Could not reach license server after {} attempts: {}. Please check your connection.",
            max_attempts, last_error
        ),
    }
}

async fn activate_license(key: &str, uid: &str) -> Result<FreemiusResponse, String> {
    let client = reqwest::Client::new();

    let clean_uid = uid.replace("-", "");

    let body = ActivateRequest {
        uid: clean_uid,
        license_key: key.to_string(),
        url: "https://keyboardtalks.pages.dev".to_string(),
        title: "KeyboardTalks".to_string(),
        version: "0.1.0".to_string(),
        is_marketing_allowed: false,
    };

    let response = client
        .post(ACTIVATE_URL)
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .json(&body)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let freemius_response = response
        .json::<FreemiusResponse>()
        .await
        .map_err(|e| format!("Invalid response from license server: {}", e))?;

    Ok(freemius_response)
}

fn save_pro_status(key: &str) {
    let instance_id = config::get().instance_id;
    let signature = sign_license(&instance_id, key);
    config::update(|c| {
        c.is_pro = true;
        c.license_key = Some(key.to_string());
        c.license_signature = Some(signature);
    });
    println!("Pro Pass activated and saved to config");
}
