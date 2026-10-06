import { createOneOfBlock, type OneOfBlock } from "../../blocks/factories/createOneOfBlock.js";
import { PixelImageBlock } from "./pixel-image.block.js";
import { SvgImageBlock } from "./svg-image.block.js";

const DamImageBlock: OneOfBlock<{ pixelImage: typeof PixelImageBlock; svgImage: typeof SvgImageBlock }> = createOneOfBlock(
    {
        supportedBlocks: {
            pixelImage: PixelImageBlock,
            svgImage: SvgImageBlock,
        },
        allowEmpty: false,
    },
    "DamImage",
);

export { DamImageBlock };
