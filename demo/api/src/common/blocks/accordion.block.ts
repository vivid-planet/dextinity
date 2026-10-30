import { createListBlock } from "@dextinity/cms-api";
import { AccordionItemBlock } from "@src/common/blocks/accordion-item.block.js";

export const AccordionBlock = createListBlock({ block: AccordionItemBlock }, "Accordion");
