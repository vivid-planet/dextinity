import { BlockData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";

class ContactFormBlockData extends BlockData {}

class ContactFormBlockInput extends BlockInput {
    transformToBlockData(): ContactFormBlockData {
        return blockInputToData(ContactFormBlockData, this);
    }
}

export const ContactFormBlock = createBlock(ContactFormBlockData, ContactFormBlockInput, "ContactForm");
