import { createExternalLinkBlock } from "../blocks/externalLink/create-external-link.block.js";

// A redirect resolves to an HTTP redirect, which has neither a target nor a rel attribute
export const RedirectsExternalLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "RedirectsExternalLink");
