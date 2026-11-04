import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlText } from "../MjmlText.js";

type Story = StoryObj<typeof MjmlText>;

const config: Meta<typeof MjmlText> = {
    title: "Components/MjmlText",
    component: MjmlText,
    tags: ["autodocs"],
};

export default config;

export const Default: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Default text with base theme styles</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
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
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText variant="heading">Heading variant</MjmlText>
                <MjmlText variant="body">Body variant</MjmlText>
                <MjmlText variant="caption">Caption variant</MjmlText>
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
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText variant="heading">Responsive heading — shrinks on mobile</MjmlText>
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
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText variant="heading" bottomSpacing>
                    Heading with bottom spacing
                </MjmlText>
                <MjmlText bottomSpacing>Base text with bottom spacing</MjmlText>
                <MjmlText>Text without bottom spacing</MjmlText>
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
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Uses the default &quot;body&quot; variant automatically</MjmlText>
                <MjmlText variant="heading">Explicit heading variant</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
