import type { ExternalLinkBlockData, MailButtonBlockData } from "@src/blocks.generated";

function createMailLink(targetUrl = "https://www.dextinity.com"): ExternalLinkBlockData {
    return { targetUrl, openInNewWindow: false, noFollow: false };
}

export function createMailButton({
    text = "Click me",
    variant = "filled",
    align = "left",
}: Partial<Pick<MailButtonBlockData, "text" | "variant" | "align">> = {}): MailButtonBlockData {
    return { text, link: createMailLink(), variant, align };
}
