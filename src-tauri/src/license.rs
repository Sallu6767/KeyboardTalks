use serde::{Deserialize, Serialize};
use crate::config;

const ACTIVATE_URL: &str = "https://api.lemonsqueezy.com/v1/licenses/activate";

#[derive(Serialize)]
struct ActivateRequest {
    license_key: String,
    instance_name: String,
}

#[derive(Deserialize, Debug)]
struct LemonResponse {
    #[serde(default)]
    valid: bool,
    #[serde(default)]
    activated: bool,
    error: Option<String>,
    #[serde(default)]
    status_formatted: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct LicenseResult {
    pub valid: bool,
    pub message: String,
}

pub async fn validate_key(license_key: &str) -> LicenseResult {
    let key = license_key.trim().to_string();

    if key.is_empty() {
        return LicenseResult {
            valid: false,
            message: "Please enter a license key.".to_string(),
        };
    }

    if config::get().is_pro && config::get().license_key.as_deref() == Some(&key) {
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
                if response.valid || response.activated {
                    save_pro_status(&key);
                    return LicenseResult {
                        valid: true,
                        message: "Pro Pass activated! Enjoy custom sounds.".to_string(),
                    };
                }

                let error_msg = response.error.unwrap_or_default();
                let error_lower = error_msg.to_lowercase();

                if error_lower.contains("already been activated for this instance")
                    || error_lower.contains("already activated for this instance")
                {
                    save_pro_status(&key);
                    return LicenseResult {
                        valid: true,
                        message: "Pro Pass verified for this device!".to_string(),
                    };
                }

                if error_lower.contains("activation limit")
                    || error_lower.contains("limit reached")
                    || error_lower.contains("maximum number of activations")
                {
                    return LicenseResult {
                        valid: false,
                        message: "Activation limit reached. Please deactivate an old device at app.lemonsqueezy.com first.".to_string(),
                    };
                }

                if error_lower.contains("not found") || error_lower.contains("invalid") {
                    return LicenseResult {
                        valid: false,
                        message: "Invalid license key. Please check the key in your receipt email.".to_string(),
                    };
                }

                if error_lower.contains("disabled") || error_lower.contains("refunded") {
                    return LicenseResult {
                        valid: false,
                        message: "This license key has been refunded or disabled.".to_string(),
                    };
                }

                return LicenseResult {
                    valid: false,
                    message: if !response.status_formatted.is_empty() {
                        format!("Activation failed: {}", response.status_formatted)
                    } else if !error_msg.is_empty() {
                        error_msg
                    } else {
                        "Activation failed. Please check your key.".to_string()
                    },
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

    if config::get().is_pro && config::get().license_key.as_deref() == Some(&key) {
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

async fn activate_license(key: &str, instance_name: &str) -> Result<LemonResponse, String> {
    let client = reqwest::Client::new();

    let body = ActivateRequest {
        license_key: key.to_string(),
        instance_name: instance_name.to_string(),
    };

    let response = client
        .post(ACTIVATE_URL)
        .header("Accept", "application/json")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&body)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let lemon_response = response
        .json::<LemonResponse>()
        .await
        .map_err(|e| format!("Invalid response from license server: {}", e))?;

    Ok(lemon_response)
}

fn save_pro_status(key: &str) {
    config::update(|c| {
        c.is_pro = true;
        c.license_key = Some(key.to_string());
    });

    println!("Pro Pass activated and saved to config");
}

pub fn is_pro() -> bool {
    config::get().is_pro
}
