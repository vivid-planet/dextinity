import type { IncomingMessage, ServerResponse } from "node:http";

import { devServerImagesPath } from "../dev-server-paths.js";
import { type ImageInfo, type ImageTransformation, toHexColor } from "../server/images/image-transformer.js";
import { readBody } from "./read-body.js";

const mimeTypesBySharpFormat: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    // libvips reports AVIF as its HEIF container format
    heif: "image/avif",
};

const sharpFormatsByMimeType = { "image/avif": "avif", "image/webp": "webp", "image/jpeg": "jpeg", "image/png": "png", "image/gif": "gif" } as const;

/**
 * Implements the operations of the Images binding with sharp, for `DevServerImageTransformer`. Wrangler's local emulation of the binding
 * only resizes and rotates, so it would ignore the DAM's crops.
 */
export async function handleImageTransformerRequest(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
    if (!request.url?.startsWith(`${devServerImagesPath}/`) || request.method !== "POST") {
        return false;
    }
    const { default: sharp } = await import("sharp");
    const operation = request.url.slice(devServerImagesPath.length + 1);
    const image = await readBody(request);

    try {
        if (operation === "info") {
            const { format, width, height } = await sharp(image).metadata();
            const mimeType = mimeTypesBySharpFormat[format];
            const info: ImageInfo = mimeType === "image/svg+xml" ? { format: mimeType } : { format: mimeType ?? format, width, height };
            response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(info));
        } else if (operation === "transform") {
            const {
                trim,
                width,
                height,
                gravity = "center",
                format,
                quality,
            }: ImageTransformation = JSON.parse(String(request.headers["x-image-transformation"]));
            const pipeline = sharp(image, { autoOrient: true });
            if (trim) {
                pipeline.extract({
                    left: Math.round(trim.left),
                    top: Math.round(trim.top),
                    width: Math.round(trim.width),
                    height: Math.round(trim.height),
                });
            }
            const output = await pipeline
                .resize(width, height, { fit: "cover", position: gravity === "auto" ? "attention" : "centre" })
                .toFormat(sharpFormatsByMimeType[format], { quality })
                .toBuffer();
            response.writeHead(200, { "content-type": format, "content-length": output.length }).end(output);
        } else if (operation === "average-color") {
            const pixel = await sharp(image).resize(1, 1, { fit: "fill" }).removeAlpha().raw().toBuffer();
            response.writeHead(200, { "content-type": "text/plain" }).end(toHexColor(pixel));
        } else {
            response.writeHead(404).end();
        }
    } catch (error) {
        response.writeHead(422).end(error instanceof Error ? error.message : String(error));
    }
    return true;
}
