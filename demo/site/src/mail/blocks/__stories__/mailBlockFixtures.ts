import type { ExternalLinkBlockData, MailButtonBlockData, MailHeadingBlockData, MailRichTextBlockData } from "@src/blocks.generated";
import { createTipTapParagraph, createTipTapRichText, loremIpsum } from "@src/storybook/blockFixtures";

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

export function createMailHeading(text: string, textBlock: "title" | "header" = "title"): MailHeadingBlockData {
    return createTipTapRichText({ type: "textBlock", attrs: { textBlock }, content: [{ type: "text", text }] });
}

export function createMailText(text = loremIpsum): MailRichTextBlockData {
    return createTipTapRichText(createTipTapParagraph(text));
}
