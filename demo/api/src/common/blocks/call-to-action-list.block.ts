import { createListBlock } from "@dextinity/cms-api";
import { CallToActionBlock } from "@src/common/blocks/call-to-action.block.js";

export const CallToActionListBlock = createListBlock({ block: CallToActionBlock }, "CallToActionList");
