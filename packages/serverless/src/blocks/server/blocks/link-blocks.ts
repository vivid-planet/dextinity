import { z } from "zod";

import { createBlock } from "../block.js";
import { linkTarget, phoneNumber } from "../validators.js";

export const ExternalLinkBlock = createBlock(
    "ExternalLink",
    z.strictObject({ targetUrl: linkTarget.optional(), openInNewWindow: z.boolean(), noFollow: z.boolean() }),
);

export const EmailLinkBlock = createBlock("EmailLink", z.strictObject({ email: z.email().optional() }));

export const PhoneLinkBlock = createBlock("PhoneLink", z.strictObject({ phone: phoneNumber.optional() }));
