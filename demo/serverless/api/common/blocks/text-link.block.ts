import { createTextLinkBlock } from "@dextinity/serverless/server";

import { LinkBlock } from "./link.block";

export const TextLinkBlock = createTextLinkBlock({ link: LinkBlock });
