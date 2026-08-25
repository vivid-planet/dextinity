import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect } from "storybook/test";

import { createRichTextBlock } from "../../blocks/richText/createRichTextBlock.js";
import { renderMailHtml } from "../../client/renderMailHtml.js";
import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { createTheme } from "../../theme/createTheme.js";
import type { TextVariantStyles, Theme } from "../../theme/themeTypes.js";
import { css } from "../../utils/css.js";
import { registerStyles } from "../registerStyles.js";

const config: Meta = {
    title: "Diagnostics/Gmail CSS Character Limit",
    parameters: { mailRoot: false },
};

export default config;

type Story = StoryObj;

/**
 * Counted per message, not per element. Past it Gmail removes every `<style>`, rather than
 * truncating.
 *
 * @see https://github.com/hteumeuleu/email-bugs/issues/90
 */
const gmailCssCharacterLimit = 16384;

const probeGreen = "#0B6E4F";
const probeRed = "#B00020";

interface StyleProbe {
    className: string;
    label: string;
}

const headCssProbe: StyleProbe = { className: "probeHeadCss", label: "Head CSS arrived" };

registerStyles(css`
    .${headCssProbe.className} > div {
        color: ${probeGreen} !important;
    }
`);

// Rendering a rich-text block is what loads the `Html*` renderers and the list styles, and those
// scale with the theme's variants. One paragraph is enough to load them.
const richTextData = {
    draftContent: {
        blocks: [
            { key: "a", text: "A paragraph, so the block renders.", type: "paragraph-standard", depth: 0, inlineStyleRanges: [], entityRanges: [] },
        ],
        entityMap: {},
    },
};

const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: { "paragraph-standard": { variant: "body" } },
});

const textVariant = (fontSize: number, mobileFontSize: number, extra?: TextVariantStyles): TextVariantStyles => ({
    fontSize: { default: `${fontSize}px`, mobile: `${mobileFontSize}px` },
    lineHeight: { default: `${Math.round(fontSize * 1.3)}px`, mobile: `${Math.round(mobileFontSize * 1.3)}px` },
    bottomSpacing: { default: "20px", mobile: "14px" },
    letterSpacing: { default: "0.2px", mobile: "0.1px" },
    ...extra,
});

/** Every variant the mails render, and the tokens for their lists. */
const renderedTokens = {
    text: {
        defaultVariant: "body",
        variants: {
            overline: textVariant(12, 11, { textTransform: "uppercase" }),
            heading: textVariant(36, 26, { fontWeight: "bold" }),
            body: textVariant(16, 15),
            caption: textVariant(12, 11, { color: "#666666" }),
        },
    },
    list: { indent: { default: 16, mobile: 8 }, markerGap: { default: 16, mobile: 8 }, itemSpacing: { default: 12, mobile: 8 } },
};

/** Only what the mail renders, which keeps the head CSS below Gmail's limit. */
const trimmedTheme = createTheme(renderedTokens);

/** The variants a branded design system defines, which puts the head CSS above Gmail's limit. */
const brandTheme = createTheme({
    ...renderedTokens,
    text: {
        ...renderedTokens.text,
        variants: {
            ...renderedTokens.text.variants,
            display: textVariant(48, 32, { fontWeight: "bold" }),
            subheading: textVariant(24, 20, { fontWeight: "bold" }),
            bodyLarge: textVariant(18, 17),
            heading3: textVariant(20, 18, { fontWeight: "bold" }),
            heading4: textVariant(18, 16, { fontWeight: "bold" }),
            lead: textVariant(22, 18),
            bodySmall: textVariant(14, 13),
            legal: textVariant(11, 10, { color: "#999999" }),
            quote: textVariant(22, 18, { fontStyle: "italic" }),
        },
    },
});

function measureHeadCssLength(mail: ReactElement): number {
    const { html } = renderMailHtml(mail);
    const htmlWithoutOutlookBlocks = html.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/g, "");

    let length = 0;
    for (const [, styleContent] of htmlWithoutOutlookBlocks.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        length += styleContent.length;
    }

    return length;
}

function ProbeLines({ probes }: { probes: readonly StyleProbe[] }): ReactElement {
    return (
        <>
            <MjmlText bottomSpacing>Green lines matched in this client. Red lines did not.</MjmlText>
            {probes.map(({ className, label }, index) => (
                <MjmlText key={className} className={className} color={probeRed} fontWeight="bold" bottomSpacing={index === probes.length - 1}>
                    {label}
                </MjmlText>
            ))}
        </>
    );
}

function SendingInstructions(): ReactElement {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText variant="caption">
                    Use &ldquo;Copy Mail HTML&rdquo; in the toolbar, paste the HTML into a Gmail draft, send it to yourself, and open it on a phone.
                    Send both stories of a pair and compare them there.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    );
}

/** The count appears in the body only, so rendering with a placeholder measures the head CSS the story shows. */
function CssCharacterLimitMail({ theme, headCssLength }: { theme: Theme; headCssLength: number }): ReactElement {
    const isAboveLimit = headCssLength > gmailCssCharacterLimit;

    return (
        <MjmlMailRoot theme={theme}>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText variant="overline" bottomSpacing>
                        {isAboveLimit ? "Above the CSS character limit — fails in Gmail" : "Below the CSS character limit — works in Gmail"}
                    </MjmlText>
                    <MjmlText variant="heading" bottomSpacing>
                        Did the head CSS of this mail arrive?
                    </MjmlText>
                    <MjmlText bottomSpacing>
                        Gmail can see {headCssLength} characters of CSS here, against a limit of {gmailCssCharacterLimit}.{" "}
                        {isAboveLimit
                            ? `That is ${headCssLength - gmailCssCharacterLimit} over, so Gmail removes all of it.`
                            : `That is ${gmailCssCharacterLimit - headCssLength} to spare, so Gmail keeps it.`}
                    </MjmlText>
                    <ProbeLines probes={[headCssProbe]} />
                    <MjmlRichTextBlock data={richTextData} />
                </MjmlColumn>
            </MjmlSection>
            <SendingInstructions />
        </MjmlMailRoot>
    );
}

const trimmedHeadCssLength = measureHeadCssLength(<CssCharacterLimitMail theme={trimmedTheme} headCssLength={0} />);
const brandHeadCssLength = measureHeadCssLength(<CssCharacterLimitMail theme={brandTheme} headCssLength={0} />);

export const BelowCssCharacterLimit: Story = {
    render: () => <CssCharacterLimitMail theme={trimmedTheme} headCssLength={trimmedHeadCssLength} />,
    play: () => {
        expect(trimmedHeadCssLength).toBeLessThanOrEqual(gmailCssCharacterLimit);
    },
};

export const AboveCssCharacterLimit: Story = {
    render: () => <CssCharacterLimitMail theme={brandTheme} headCssLength={brandHeadCssLength} />,
    play: () => {
        expect(brandHeadCssLength).toBeGreaterThan(gmailCssCharacterLimit);
    },
};
