import { acceptedFileTypes, maxFileSizeBytes } from "@src/util/fileUpload";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/fileUploadRoute";

export function loader() {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export async function action({ request, context }: Route.ActionArgs) {
    // Imported lazily because the module throws on import if its environment variables are missing, which would break the whole site
    const { assessRecaptchaToken } = await import("@src/util/recaptcha/assessRecaptchaToken");

    const { domain } = getSiteContext(context);
    const formData = await request.formData();

    const file = formData.get("file");
    const recaptchaToken = formData.get("recaptchaToken");

    if (!(file instanceof File)) {
        return Response.json({ message: "Missing file" }, { status: 400 });
    }

    if (typeof recaptchaToken !== "string") {
        return Response.json({ message: "Missing recaptchaToken" }, { status: 400 });
    }

    if (!acceptedFileTypes.includes(file.type)) {
        return Response.json({ message: `File type not allowed: ${file.name}` }, { status: 400 });
    }

    if (file.size > maxFileSizeBytes) {
        return Response.json({ message: `File too large: ${file.name}` }, { status: 400 });
    }

    const siteConfig = getSiteConfigForDomain(domain);

    const recaptchaTokenValid = await assessRecaptchaToken({
        token: recaptchaToken,
        action: "file_upload",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return Response.json({ message: "ReCAPTCHA assessment failed" }, { status: 403 });
    }

    if (!process.env.API_URL_INTERNAL) {
        console.error("API_URL_INTERNAL is not set");
        return Response.json({ message: "Something went wrong processing the file upload" }, { status: 500 });
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
            return Response.json({ message: `File upload failed for ${file.name}` }, { status: 502 });
        }

        const uploaded = (await uploadResponse.json()) as { id: string };
        return Response.json({ id: uploaded.id }, { status: 200 });
    } catch (e) {
        console.error(e);
        return Response.json({ message: "Something went wrong processing the file upload" }, { status: 500 });
    }
}
