import { MjmlColumn, MjmlRaw, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { HtmlDivider } from "../HtmlDivider.js";

type Story = StoryObj<typeof HtmlDivider>;

const config: Meta<typeof HtmlDivider> = {
    title: "Components/HtmlDivider",
    component: HtmlDivider,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "text" },
        height: { control: "number" },
        backgroundColor: { control: "text" },
        backgroundImage: { control: "text" },
        className: { control: "text" },
        style: { control: false },
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlSpacer height="16px" />
                <MjmlRaw>
                    <tr>
                        <td style={{ fontSize: 0, lineHeight: 0, msoLineHeightRule: "exactly" }}>
                            <HtmlDivider {...args} />
                        </td>
                    </tr>
                </MjmlRaw>
                <MjmlSpacer height="16px" />
            </MjmlColumn>
        </MjmlSection>
    ),
};

export default config;

export const Default: Story = {};

export const CustomHeightAndColor: Story = {
    args: {
        height: 8,
        backgroundColor: "#FF6B6B",
    },
};

export const WithTheme: Story = {
    parameters: {
        theme: createTheme({
            divider: {
                height: 2,
                backgroundColor: "#5B4FC7",
            },
        }),
    },
};

export const WithVariants: Story = {
    parameters: {
        theme: createTheme({
            divider: {
                defaultVariant: "thin",
                variants: {
                    thin: { height: 1, backgroundColor: "#999999" },
                    thick: { height: { default: 12, mobile: 8 }, backgroundColor: "#222222" },
                },
            },
        }),
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlSpacer height="16px" />
                <MjmlRaw>
                    <tr>
                        <td style={{ fontSize: 0, lineHeight: 0, msoLineHeightRule: "exactly" }}>
                            <HtmlDivider {...args} />
                        </td>
                    </tr>
                </MjmlRaw>
                <MjmlSpacer height="16px" />
                <MjmlRaw>
                    <tr>
                        <td style={{ fontSize: 0, lineHeight: 0, msoLineHeightRule: "exactly" }}>
                            <HtmlDivider {...args} variant="thick" />
                        </td>
                    </tr>
                </MjmlRaw>
                <MjmlSpacer height="16px" />
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const GradientWithFallback: Story = {
    // `backgroundColor` is the solid fallback for clients that
    // don't render `background-image` (notably older Outlook).
    args: {
        height: 6,
        backgroundColor: "#5B4FC7",
        backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B, #FFD166)",
    },
};
