import { acceptedFileTypes, maxFileSizeBytes } from "@src/util/fileUpload";
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import type { Context } from "hono";

export async function fileUploadRoute(c: Context) {
    const { domain } = getSiteContext();
    const formData = await c.req.formData();

    const file = formData.get("file");
    const recaptchaToken = formData.get("recaptchaToken");

    if (!(file instanceof File)) {
        return c.json({ message: "Missing file" }, 400);
    }

    if (typeof recaptchaToken !== "string") {
        return c.json({ message: "Missing recaptchaToken" }, 400);
    }

    if (!acceptedFileTypes.includes(file.type)) {
        return c.json({ message: `File type not allowed: ${file.name}` }, 400);
    }

    if (file.size > maxFileSizeBytes) {
        return c.json({ message: `File too large: ${file.name}` }, 400);
    }

    const siteConfig = getSiteConfigForDomain(domain);

    const recaptchaTokenValid = await assessRecaptchaToken({
        token: recaptchaToken,
        action: "file_upload",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return c.json({ message: "ReCAPTCHA assessment failed" }, 403);
    }

    if (!process.env.API_URL_INTERNAL) {
        console.error("API_URL_INTERNAL is not set");
        return c.json({ message: "Something went wrong processing the file upload" }, 500);
    }

    try {
        const uploadBody = new FormData();
        uploadBody.append("file", file, file.name);

        const uploadResponse = await fetch(`${process.env.API_URL_INTERNAL}/file-uploads/upload`, {
            method: "POST",
            body: uploadBody,
        });

        if (!uploadResponse.ok) {
            console.error(`File upload failed for ${file.name}: ${uploadResponse.status} ${await uploadResponse.text()}`);
            return c.json({ message: `File upload failed for ${file.name}` }, 502);
        }

        const uploaded = (await uploadResponse.json()) as { id: string };
        return c.json({ id: uploaded.id }, 200);
    } catch (e) {
        console.error(e);
        return c.json({ message: "Something went wrong processing the file upload" }, 500);
    }
}
