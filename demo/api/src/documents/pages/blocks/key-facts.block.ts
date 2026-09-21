import { createListBlock } from "@dextinity/cms-api";
import { KeyFactsItemBlock } from "@src/documents/pages/blocks/key-facts-item.block";

export const KeyFactsBlock = createListBlock({ block: KeyFactsItemBlock }, { name: "KeyFacts", description: "A list of key facts." });
