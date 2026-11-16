import { createListBlock } from "@dextinity/cms-api";
import { KeyFactsItemBlock } from "@src/documents/pages/blocks/key-facts-item.block.js";

export const KeyFactsBlock = createListBlock({ block: KeyFactsItemBlock }, "KeyFacts");
