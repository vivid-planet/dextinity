import { MjmlColumn, MjmlRaw } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { HtmlText } from "../HtmlText.js";

type Story = StoryObj<typeof HtmlText>;

const config: Meta<typeof HtmlText> = {
    title: "Components/HtmlText",
    component: HtmlText,
    tags: ["autodocs"],
};

export default config;

export const Default: Story = {
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <HtmlText>Default text with base theme styles</HtmlText>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText("Default text with base theme styles")).toBeInTheDocument();
    },
};

export const WithVariants: Story = {
    parameters: {
        theme: createTheme({
            text: {
                variants: {
                    heading: { fontSize: "32px", fontWeight: 700, lineHeight: "40px" },
                    body: { fontSize: "16px", lineHeight: "24px" },
                    caption: { fontSize: "12px", lineHeight: "16px", color: "#666666" },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <HtmlText variant="heading">Heading variant</HtmlText>
                    </tr>
                    <tr>
                        <HtmlText variant="body">Body variant</HtmlText>
                    </tr>
                    <tr>
                        <HtmlText variant="caption">Caption variant</HtmlText>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const ResponsiveVariants: Story = {
    parameters: {
        theme: createTheme({
            text: {
                variants: {
                    heading: {
                        fontSize: { default: "32px", mobile: "24px" },
                        lineHeight: { default: "40px", mobile: "30px" },
                        fontWeight: 700,
                    },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <HtmlText variant="heading">Responsive heading — shrinks on mobile</HtmlText>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const BottomSpacing: Story = {
    parameters: {
        theme: createTheme({
            text: {
                bottomSpacing: "20px",
                variants: {
                    heading: { fontSize: "32px", fontWeight: 700, bottomSpacing: { default: "24px", mobile: "16px" } },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <HtmlText variant="heading" bottomSpacing>
                            Heading with bottom spacing
                        </HtmlText>
                    </tr>
                    <tr>
                        <HtmlText bottomSpacing>Base text with bottom spacing</HtmlText>
                    </tr>
                    <tr>
                        <HtmlText>Text without bottom spacing</HtmlText>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const DefaultVariant: Story = {
    parameters: {
        theme: createTheme({
            text: {
                defaultVariant: "body",
                variants: {
                    body: { fontSize: "14px", lineHeight: "22px" },
                    heading: { fontSize: "28px", fontWeight: 700 },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <HtmlText>Uses the default &quot;body&quot; variant automatically</HtmlText>
                    </tr>
                    <tr>
                        <HtmlText variant="heading">Explicit heading variant</HtmlText>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const ElementPropAsDiv: Story = {
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlText element="div">Rendered as a div with theme styles</HtmlText>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const ElementPropAsAnchor: Story = {
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlText element="a" href="https://example.com" style={{ textDecoration: "underline" }}>
                                Rendered as an anchor with href
                            </HtmlText>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
