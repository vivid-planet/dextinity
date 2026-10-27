export type ImageOutputFormat = "image/avif" | "image/webp" | "image/jpeg" | "image/png" | "image/gif";

export interface ImageTransformation {
    /** The area of the original to keep, in pixels. Applied before resizing. */
    trim?: { left: number; top: number; width: number; height: number };
    width: number;
    height: number;
    /** Which part to keep when the aspect ratio changes. `auto` detects the most interesting part of the image. */
    gravity?: "auto" | "center";
    format: ImageOutputFormat;
    quality?: number;
}

export type ImageInfo = { format: "image/svg+xml" } | { format: string; width: number; height: number };

/**
 * Transforms images, implemented with the Images binding on Cloudflare Workers and with sharp in local development.
 */
export interface ImageTransformer {
    info(image: ReadableStream<Uint8Array>): Promise<ImageInfo>;
    transform(image: ReadableStream<Uint8Array>, transformation: ImageTransformation): Promise<Response>;
    /** The average color as hex, e.g. `#a0b1c2` */
    averageColor(image: ReadableStream<Uint8Array>): Promise<string>;
}

export function toHexColor([red, green, blue]: Uint8Array): string {
    return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}
