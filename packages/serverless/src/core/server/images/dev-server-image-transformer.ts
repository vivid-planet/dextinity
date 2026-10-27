import { devServerImagesPath } from "../../dev-server-paths.js";
import type { ImageInfo, ImageTransformation, ImageTransformer } from "./image-transformer.js";

/**
 * Transforms images with sharp in the Vite dev server (`dextinityDevServer()` of `@dextinity/serverless/vite`), which runs in Node.js next to
 * the Worker. Only for local development.
 */
export class DevServerImageTransformer implements ImageTransformer {
    /**
     * @param origin The origin of the Vite dev server, e.g. `new URL(c.req.url).origin`
     */
    constructor(private readonly origin: string) {}

    async info(image: ReadableStream<Uint8Array>): Promise<ImageInfo> {
        return (await this.request("info", image)).json();
    }

    transform(image: ReadableStream<Uint8Array>, transformation: ImageTransformation): Promise<Response> {
        return this.request("transform", image, transformation);
    }

    async averageColor(image: ReadableStream<Uint8Array>): Promise<string> {
        return (await this.request("average-color", image)).text();
    }

    private async request(operation: string, image: ReadableStream<Uint8Array>, transformation?: ImageTransformation): Promise<Response> {
        const response = await fetch(`${this.origin}${devServerImagesPath}/${operation}`, {
            method: "POST",
            body: await new Response(image).arrayBuffer(),
            headers: transformation ? { "x-image-transformation": JSON.stringify(transformation) } : {},
        });
        if (!response.ok) {
            throw new Error(`Image ${operation} failed in the dev server: ${response.status} ${await response.text()}`);
        }
        return response;
    }
}
