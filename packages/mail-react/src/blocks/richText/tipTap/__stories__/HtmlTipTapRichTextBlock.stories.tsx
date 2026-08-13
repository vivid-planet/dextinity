import { MjmlColumn, MjmlRaw } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../../../components/section/MjmlSection.js";
import { createTheme } from "../../../../theme/createTheme.js";
import { createTipTapRichTextBlock } from "../createTipTapRichTextBlock.js";
import { exampleBlockData, inlineStyleBlockData, listBlockData, listVariantsBlockData, textBlockStylesBlockData } from "./exampleBlockData.js";

const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

type Story = StoryObj<typeof HtmlTipTapRichTextBlock>;

const config: Meta<typeof HtmlTipTapRichTextBlock> = {
    title: "Blocks/HtmlTipTapRichTextBlock",
    component: HtmlTipTapRichTextBlock,
    tags: ["autodocs"],
    parameters: {
        docs: {
            source: {
                // "code" shows the story's own source, which creates the theme and the block, instead of the rendered JSX.
                type: "code",
            },
            description: {
                // Duplicates the TSDoc on HtmlTipTapRichTextBlock in createTipTapRichTextBlock.tsx — Storybook cannot read it from factory return type properties. Update both when the description changes.
                component:
                    "Renders CMS TipTapRichText block data as one `HtmlText` div per text block, for raw-HTML contexts such as `MjmlRaw`. Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlTipTapRichTextBlock` in a `<tr>` and `<td>` of its own.",
            },
        },
    },
};

export default config;

/** A block from `createTipTapRichTextBlock()` without options: every text block renders with the base theme text styles, and formatting such as bold, italic and links needs no configuration. */
export const Default: Story = {
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

        return (
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
        );
    },
};

/** The look of each style the editor can pick, through the `textBlockStyles` option. Text with no style uses the theme's default variant. */
export const WithTextBlockStyles: Story = {
    parameters: {
        theme: createTheme({
            text: {
                defaultVariant: "copy",
                variants: {
                    title: { fontSize: "32px", fontWeight: 700, lineHeight: "40px", bottomSpacing: "24px" },
                    intro: { fontSize: "20px", lineHeight: "28px", bottomSpacing: "20px" },
                    copy: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" },
                },
            },
        }),
    },
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlockStyles: {
                title: { variant: "title" },
                intro: { variant: "intro" },
            },
        });

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlRaw>
                        <tr>
                            <td>
                                <HtmlTipTapRichTextBlock data={textBlockStylesBlockData} />
                            </td>
                        </tr>
                    </MjmlRaw>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

/** Lists with their own look: `textBlocks` sets the look of a list with no style, and `textBlockStyles` the look of each list style the editor can pick. */
export const WithListVariants: Story = {
    parameters: {
        theme: createTheme({
            text: {
                defaultVariant: "copy",
                variants: {
                    copy: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" },
                    list: { fontSize: "14px", lineHeight: "20px", bottomSpacing: "16px" },
                    listLarge: { fontSize: "20px", lineHeight: "28px", bottomSpacing: "16px" },
                },
            },
        }),
    },
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlocks: {
                "unordered-list": { variant: "list" },
                "ordered-list": { variant: "list" },
            },
            textBlockStyles: {
                listLarge: { variant: "listLarge" },
            },
        });

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlRaw>
                        <tr>
                            <td>
                                <HtmlTipTapRichTextBlock data={listVariantsBlockData} />
                            </td>
                        </tr>
                    </MjmlRaw>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

/** Lists render as a table, not as `<ul>` / `<ol>`, so their indent and spacing hold across email clients. Nested levels keep their own markers and stay inside one text component. */
export const Lists: Story = {
    parameters: {
        theme: createTheme({
            text: {
                defaultVariant: "body",
                variants: { body: { fontSize: "16px", lineHeight: "24px", bottomSpacing: "16px" } },
            },
            list: {
                unorderedMarker: ({ depth }) => ["▪", "–", "·"][depth % 3],
                orderedMarker: ({ index }) => `${String(index + 1)}.`,
            },
        }),
    },
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

        return (
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
        );
    },
};

/** Configuring a custom link type via the `linkTypes` option. The built-in `external` resolver is included by default; add entries for any other link types your CMS uses (e.g. `internal`) to render them as anchors. Email links must be absolute URLs, so the resolver prepends the site's base URL. */
export const WithCustomLinkType: Story = {
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            linkTypes: {
                internal: (props: { targetPage: { path: string } }) => `https://example.com${props.targetPage.path}`,
            },
        });

        return (
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
        );
    },
};

/** Rendering an inline style via the `inlineStyles` option. `highlight` is not a built-in — the application defines it in its RTE, and the email decides how it looks. The marks beside it (`underline`, `superscript`, `subscript`) are built in. */
export const WithInlineStyle: Story = {
    render: () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            inlineStyles: {
                highlight: (children, { key }) => (
                    <span key={key} style={{ backgroundColor: "#ff0000", color: "#ffffff" }}>
                        {children}
                    </span>
                ),
            },
        });

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlRaw>
                        <tr>
                            <td>
                                <HtmlTipTapRichTextBlock data={inlineStyleBlockData} />
                            </td>
                        </tr>
                    </MjmlRaw>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};
