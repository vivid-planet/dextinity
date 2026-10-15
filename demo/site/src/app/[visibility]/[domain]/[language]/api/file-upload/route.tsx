import { acceptedFileTypes, maxFileSizeBytes } from "@src/util/fileUpload";
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";

// The multipart envelope (boundaries and part headers) adds a few hundred bytes on top of the file itself.
const multipartOverheadBytes = 4 * 1024;
const maxRequestSizeBytes = maxFileSizeBytes + multipartOverheadBytes;

// Counts the bytes flowing through and aborts as soon as the limit is exceeded. Keeps the hard size limit
// in place without ever holding the upload in memory, even when Content-Length is missing or forged.
const createSizeLimitedStream = (maxSizeBytes: number, onLimitExceeded: () => void) => {
    let bytesRead = 0;

    return new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            bytesRead += chunk.byteLength;

            if (bytesRead > maxSizeBytes) {
                onLimitExceeded();
                controller.error(new Error("File exceeds the maximum size"));
                return;
            }

            controller.enqueue(chunk);
        },
    });
};

export async function POST(request: NextRequest, context: RouteContext<"/[visibility]/[domain]/[language]/api/file-upload">) {
    const { domain } = await context.params;

    // Reject oversized requests before touching the body. Content-Length may be missing or forged, so the
    // byte counter on the stream below is the binding second barrier.
    if (Number(request.headers.get("content-length")) > maxRequestSizeBytes) {
        return NextResponse.json({ message: "File too large" }, { status: 413 });
    }

    // The reCAPTCHA token and the file type travel in headers instead of the multipart body, so an invalid
    // request is rejected without reading a single byte of the upload.
    const recaptchaToken = request.headers.get("x-recaptcha-token");
    const fileType = request.headers.get("x-file-type");

    if (!recaptchaToken) {
        return NextResponse.json({ message: "Missing recaptchaToken" }, { status: 400 });
    }

    if (!fileType || !acceptedFileTypes.includes(fileType)) {
        return NextResponse.json({ message: "File type not allowed" }, { status: 415 });
    }

    const requestBody = request.body;

    if (requestBody === null) {
        return NextResponse.json({ message: "Missing file" }, { status: 400 });
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

    let sizeLimitExceeded = false;

    try {
        // The body is piped through to the API untouched instead of being parsed into memory. The original
        // content type carries the multipart boundary, so the API can separate the fields itself.
        const body = requestBody.pipeThrough(
            createSizeLimitedStream(maxRequestSizeBytes, () => {
                sizeLimitExceeded = true;
            }),
        );

        // duplex is required when streaming a request body, but is not part of the fetch types yet.
        const requestInit: RequestInit & { duplex: "half" } = {
            method: "POST",
            headers: { "content-type": request.headers.get("content-type") ?? "" },
            body,
            duplex: "half",
        };

        const uploadResponse = await fetch(`${process.env.API_URL_INTERNAL}/file-uploads/upload`, requestInit);

        if (!uploadResponse.ok) {
            console.error(`File upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`);

            // The API validates size and mime type against the file contents itself. Pass its rejections
            // through, so the user learns that the file was rejected instead of seeing a generic error.
            if (uploadResponse.status >= 400 && uploadResponse.status < 500) {
                return NextResponse.json({ message: "File was rejected" }, { status: uploadResponse.status });
            }

            return NextResponse.json({ message: "File upload failed" }, { status: 502 });
        }

        const uploaded = (await uploadResponse.json()) as { id: string };
        return NextResponse.json({ id: uploaded.id }, { status: 200 });
    } catch (e) {
        if (sizeLimitExceeded) {
            return NextResponse.json({ message: "File too large" }, { status: 413 });
        }

        console.error(e);
        return NextResponse.json({ message: "Something went wrong processing the file upload" }, { status: 500 });
    }
}
