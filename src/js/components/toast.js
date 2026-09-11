function showToast(message, type = "info", duration = 3000) {

    const container = document.getElementById("toast-container");
    if (!container) {
        console.warn("[Toast] Container not found");
        return;
    }

    const toast = document.createElement("div");

    let typeClass = "toast-info";
    let icon = "ℹ️";

    if (type === "success") {
        typeClass = "toast-success";
        icon = "✅";
    } else if (type === "error") {
        typeClass = "toast-error";
        icon = "❌";
    }

    toast.className = `toast ${typeClass}`;

    toast.innerHTML = `
        <span class="mr-2">${icon}</span>
        <span>${escapeHtml(message)}</span>
    `;

    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.marginTop = "8px";

    container.appendChild(toast);

    setTimeout(() => {
        dismissToast(toast);
    }, duration);
}

function dismissToast(toast) {

    toast.classList.remove("animate-toast-in");
    toast.classList.add("animate-toast-out");

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 200);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

window.showToast = showToast;
