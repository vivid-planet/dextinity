import { createOneOfBlock, type OneOfBlock } from "../../blocks/factories/createOneOfBlock";
import { PixelImageBlock } from "./pixel-image.block";
import { SvgImageBlock } from "./svg-image.block";

const DamImageBlock: OneOfBlock<{ pixelImage: typeof PixelImageBlock; svgImage: typeof SvgImageBlock }> = createOneOfBlock(
    {
        supportedBlocks: {
            pixelImage: PixelImageBlock,
            svgImage: SvgImageBlock,
        },
        allowEmpty: false,
    },
    {
        name: "DamImage",
        description: "An image from the Digital Asset Management, either a pixel image or an SVG.",
    },
);

export { DamImageBlock };
