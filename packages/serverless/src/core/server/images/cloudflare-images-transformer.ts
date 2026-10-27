import { type ImageInfo, type ImageTransformation, type ImageTransformer, toHexColor } from "./image-transformer.js";

interface ImagesTransformerLike {
    transform(transformation: object): ImagesTransformerLike;
    output(options: { format: string; quality?: number }): Promise<{ response(): Response }>;
}

/**
 * The subset of Cloudflare's `ImagesBinding` the transformer uses. Declared here so the library doesn't depend on
 * `@cloudflare/workers-types`, whose globals conflict with the DOM types.
 */
export interface ImagesBindingLike {
    info(image: ReadableStream<Uint8Array>): Promise<ImageInfo>;
    input(image: ReadableStream<Uint8Array>): ImagesTransformerLike;
}

/**
 * Transforms images with the Images binding. Wrangler's local emulation of the binding only resizes and rotates, so use
 * `DevServerImageTransformer` in local development.
 */
export class CloudflareImagesTransformer implements ImageTransformer {
    constructor(private readonly images: ImagesBindingLike) {}

    info(image: ReadableStream<Uint8Array>): Promise<ImageInfo> {
        return this.images.info(image);
    }

    async transform(image: ReadableStream<Uint8Array>, { trim, width, height, gravity = "center", format, quality }: ImageTransformation) {
        let transformer = this.images.input(image);
        if (trim) {
            transformer = transformer.transform({ trim });
        }
        const result = await transformer.transform({ width, height, fit: "cover", gravity }).output({ format, quality });
        return result.response();
    }

    async averageColor(image: ReadableStream<Uint8Array>): Promise<string> {
        const result = await this.images.input(image).transform({ width: 1, height: 1, fit: "squeeze" }).output({ format: "rgb" });
        return toHexColor(new Uint8Array(await result.response().arrayBuffer()));
    }
}
