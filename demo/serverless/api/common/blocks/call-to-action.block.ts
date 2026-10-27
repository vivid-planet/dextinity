import { createBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { TextLinkBlock } from "./text-link.block";

const CallToActionBlock = createBlock(
    "CallToAction",
    z.strictObject({ textLink: TextLinkBlock.schema, variant: z.enum(["contained", "outlined", "text"]) }),
);

export const CallToActionListBlock = createListBlock({ name: "CallToActionList", block: CallToActionBlock });
