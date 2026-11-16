import { createBlocksBlock } from "../../../../factories/createBlocksBlock.js";
import { BBlock } from "./BBlock.js";

export const ABlock = createBlocksBlock({ supportedBlocks: { b: BBlock, b2: BBlock } }, "ABlocksBlock");
