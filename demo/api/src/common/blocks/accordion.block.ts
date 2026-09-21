import { createListBlock } from "@dextinity/cms-api";
import { AccordionItemBlock } from "@src/common/blocks/accordion-item.block";

export const AccordionBlock = createListBlock(
    { block: AccordionItemBlock },
    { name: "Accordion", description: "A list of accordion items, where each item opens to show its content." },
);
