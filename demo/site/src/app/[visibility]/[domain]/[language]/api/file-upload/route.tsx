import { acceptedFileTypes, maxFileSizeBytes } from "@src/util/fileUpload";
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: RouteContext<"/[visibility]/[domain]/[language]/api/file-upload">) {
    const { domain } = await context.params;
    const formData = await request.formData();

    const file = formData.get("file");
    const recaptchaToken = formData.get("recaptchaToken");

    if (!(file instanceof File)) {
        return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    if (typeof recaptchaToken !== "string") {
        return NextResponse.json({ message: "Missing recaptchaToken" }, { status: 400 });
    }

    if (!acceptedFileTypes.includes(file.type)) {
        return NextResponse.json({ message: `File type not allowed: ${file.name}` }, { status: 400 });
    }

    if (file.size > maxFileSizeBytes) {
        return NextResponse.json({ message: `File too large: ${file.name}` }, { status: 400 });
    }

    const siteConfig = getSiteConfigForDomain(domain);

    const recaptchaTokenValid = await assessRecaptchaToken({
        token: recaptchaToken,
        action: "file_upload",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return NextResponse.json({ message: "ReCAPTCHA assessment failed" }, { status: 403 });
    }

    if (!process.env.API_URL_INTERNAL) {
        console.error("API_URL_INTERNAL is not set");
        return NextResponse.json({ message: "Something went wrong processing the file upload" }, { status: 500 });
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
            return NextResponse.json({ message: `File upload failed for ${file.name}` }, { status: 502 });
        }

        const uploaded = (await uploadResponse.json()) as { id: string };
        return NextResponse.json({ id: uploaded.id }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Something went wrong processing the file upload" }, { status: 500 });
    }
}
