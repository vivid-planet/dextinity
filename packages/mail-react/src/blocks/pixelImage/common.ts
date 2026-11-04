import type { PixelImageBlockData } from "../../blocks.generated.js";

export type PixelImageBlockBaseProps = {
    /** The block data to render. */
    data: PixelImageBlockData;
    /** Width at which the image is rendered, in the default/desktop breakpoint. */
    width: number;
    /**
     * Largest possible width the image can be rendered at across breakpoints.
     * Defaults to `theme.sizes.bodyWidth`. Use this when the image can stretch
     * wider on a narrower breakpoint than its desktop render width.
     */
    largestPossibleRenderWidth?: number;
    /**
     * Aspect ratio for the rendered image.
     * @example "16x9"
     */
    aspectRatio?: number | string;
};
