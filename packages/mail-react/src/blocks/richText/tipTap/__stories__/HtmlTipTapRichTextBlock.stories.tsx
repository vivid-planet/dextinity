import { MjmlColumn, MjmlRaw } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../../../components/section/MjmlSection.js";
import { createTheme } from "../../../../theme/createTheme.js";
import { createTipTapRichTextBlock } from "../createTipTapRichTextBlock.js";
import { exampleBlockData, inlineStyleBlockData, listBlockData, placeholderBlockData, textBlockStylesBlockData } from "./exampleBlockData.js";

const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

type Story = StoryObj<typeof HtmlTipTapRichTextBlock>;

const config: Meta<typeof HtmlTipTapRichTextBlock> = {
    title: "Blocks/HtmlTipTapRichTextBlock",
    component: HtmlTipTapRichTextBlock,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                // Duplicates the TSDoc on HtmlTipTapRichTextBlock in createTipTapRichTextBlock.tsx — Storybook cannot read it from factory return type properties. Update both when the description changes.
                component:
                    "Renders CMS TipTapRichText block data as one `HtmlText` div per text block, for raw-HTML contexts such as `MjmlRaw`. Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlTipTapRichTextBlock` in a `<tr>` and `<td>` of its own.",
            },
        },
    },
};

export default config;

const listTheme = createTheme({
    text: {
        defaultVariant: "body",
        variants: { body: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" } },
    },
    list: {
        unorderedMarker: ({ depth }) => ["▪", "–", "·"][depth % 3],
        orderedMarker: ({ index }) => `${String(index + 1)}.`,
    },
});

/** Lists render as a table, not as `<ul>` / `<ol>`, so their indent and spacing hold across email clients. Nested levels keep their own markers and stay inside one text component. */
export const Lists: Story = {
    parameters: {
        theme: listTheme,
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlTipTapRichTextBlock data={listBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** A block from `createTipTapRichTextBlock()` without options: every text block renders with the base theme text styles, and the built-in marks still apply. */
export const Default: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlTipTapRichTextBlock data={exampleBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

const themeWithVariants = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading1: { fontSize: "32px", fontWeight: 700, lineHeight: "40px", bottomSpacing: "24px" },
            heading2: { fontSize: "24px", fontWeight: 700, lineHeight: "32px", bottomSpacing: "20px" },
            body: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" },
        },
    },
});

const { HtmlTipTapRichTextBlock: HtmlVariantsTipTapRichTextBlock } = createTipTapRichTextBlock({
    blockTypes: {
        "heading-1": { variant: "heading1" },
        "heading-2": { variant: "heading2" },
    },
});

/** Heading levels mapped to theme text variants via the factory's `blockTypes` option. Paragraphs and lists are unmapped, so they take the theme's default variant. */
export const WithVariants: Story = {
    parameters: {
        theme: themeWithVariants,
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlVariantsTipTapRichTextBlock data={exampleBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

const themeWithStyleVariants = createTheme({
    text: {
        defaultVariant: "copy",
        variants: {
            title: { fontSize: "32px", fontWeight: 700, lineHeight: "40px", bottomSpacing: "24px" },
            intro: { fontSize: "20px", lineHeight: "28px", bottomSpacing: "20px" },
            copy: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" },
            copySmall: { fontSize: "14px", lineHeight: "20px", bottomSpacing: "12px" },
        },
    },
});

const { HtmlTipTapRichTextBlock: HtmlStyledTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        title: { variant: "title" },
        intro: { variant: "intro" },
        listSmall: { variant: "copySmall" },
    },
});

/** The styles an application defines in its RTE, mapped through `textBlockStyles`. A list takes its style from the paragraph inside its items, which is where the editor stores it. */
export const WithTextBlockStyles: Story = {
    parameters: {
        theme: themeWithStyleVariants,
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlStyledTipTapRichTextBlock data={textBlockStylesBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

function resolveInternalLinkHref(props: { targetPage: { path: string } }): string {
    return `https://example.com${props.targetPage.path}`;
}

const { HtmlTipTapRichTextBlock: HtmlCustomLinkTypeTipTapRichTextBlock } = createTipTapRichTextBlock({
    linkTypes: {
        internal: resolveInternalLinkHref,
    },
});

/** Configuring a custom link type via the `linkTypes` option. The built-in `external` resolver is included by default; add entries for any other link types your CMS uses (e.g. `internal`) to render them as anchors. Email links must be absolute URLs, so the resolver prepends the site's base URL. */
export const WithCustomLinkType: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlCustomLinkTypeTipTapRichTextBlock data={exampleBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

const { HtmlTipTapRichTextBlock: HtmlInlineStyleTipTapRichTextBlock } = createTipTapRichTextBlock({
    inlineStyles: {
        highlight: (children, { key }) => (
            <span key={key} style={{ backgroundColor: "#ff0000", color: "#ffffff" }}>
                {children}
            </span>
        ),
    },
});

/** Rendering an inline style via the `inlineStyles` option. `highlight` is not a built-in — the application defines it in its RTE, and the email decides how it looks. The marks beside it (`underline`, `superscript`, `subscript`) are built in. */
export const WithInlineStyle: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlInlineStyleTipTapRichTextBlock data={inlineStyleBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** A placeholder renders the literal text the editor shows, so whatever sends the mail can substitute it. */
export const WithPlaceholder: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlTipTapRichTextBlock data={placeholderBlockData} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
