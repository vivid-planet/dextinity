/// <reference types="grecaptcha" />

export async function getRecaptchaToken(action: "form_submit" | "file_upload", recaptchaKey: string): Promise<string> {
    if (!recaptchaKey) {
        return Promise.reject("Missing reCAPTCHA key");
    }

    if (typeof grecaptcha.enterprise === "undefined") {
        return Promise.reject("grecaptcha.enterprise is not defined");
    }

    return new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject("Failed to load reCAPTCHA library");
        }, 3000);
        grecaptcha.enterprise.ready(() => {
            window.clearTimeout(timeout);
            resolve();
        });
    }).then(() => {
        return grecaptcha.enterprise.execute(recaptchaKey, {
            action,
        });
    });
}
