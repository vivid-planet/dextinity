import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

if (process.env.RECAPTCHA_SERVICE_ACCOUNT === undefined) {
    throw new Error("Missing RECAPTCHA_SERVICE_ACCOUNT environment variable");
}

const serviceAccountObject = JSON.parse(Buffer.from(process.env.RECAPTCHA_SERVICE_ACCOUNT, "base64").toString("utf8"));

export const recaptchaClient = new RecaptchaEnterpriseServiceClient({
    credentials: serviceAccountObject,
});

export const recaptchaResourceName = recaptchaClient.projectPath(serviceAccountObject.project_id);
