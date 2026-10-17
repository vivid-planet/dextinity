import { createExternalLinkBlock } from "../blocks/externalLink/create-external-link.block";

// A redirect resolves to an HTTP redirect, which has neither a target nor a rel attribute
export const RedirectsExternalLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "RedirectsExternalLink");
