import { MjmlColumn, MjmlRaw } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { registerStyles } from "../../../styles/registerStyles.js";
import { createTheme } from "../../../theme/createTheme.js";
import { css } from "../../../utils/css.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { HtmlButton } from "../HtmlButton.js";

type Story = StoryObj<typeof HtmlButton>;

// TODO: Replace with a dedicated `HtmlSpacer` component (future PR).
function TemporaryHtmlSpacer({ height }: { height: string }) {
    return <div style={{ height, lineHeight: height, msoLineHeightRule: "exactly" }}>&nbsp;</div>;
}

const config: Meta<typeof HtmlButton> = {
    title: "Components/HtmlButton",
    component: HtmlButton,
    tags: ["autodocs"],
    args: {
        href: "https://example.com",
        children: "Click me",
    },
    argTypes: {
        variant: { control: "text" },
        fullWidth: { control: "boolean" },
        href: { control: "text" },
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton {...args} />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export default config;

export const Default: Story = {};

export const WithVariants: Story = {
    parameters: {
        theme: createTheme({
            button: {
                defaultVariant: "primary",
                variants: {
                    primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
                    secondary: { backgroundColor: "#EEEEEE", color: "#222222" },
                    tertiary: { backgroundColor: "#FFFFFF", border: "3px solid #5B4FC7", color: "#5B4FC7" },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton href="https://example.com">Primary (default)</HtmlButton>
                            <TemporaryHtmlSpacer height="16px" />
                            <HtmlButton href="https://example.com" variant="secondary">
                                Secondary
                            </HtmlButton>
                            <TemporaryHtmlSpacer height="16px" />
                            <HtmlButton href="https://example.com" variant="tertiary">
                                Tertiary
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const ResponsiveVariants: Story = {
    parameters: {
        theme: createTheme({
            button: {
                variants: {
                    primary: {
                        backgroundColor: "#5B4FC7",
                        color: "#FFFFFF",
                        fontSize: { default: "16px", mobile: "13px" },
                        padding: { default: "14px 32px", mobile: "10px 20px" },
                    },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton href="https://example.com" variant="primary">
                                Shrinks on mobile
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const DefaultVariant: Story = {
    parameters: {
        theme: createTheme({
            button: {
                defaultVariant: "primary",
                variants: {
                    primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton href="https://example.com">Uses the default &quot;primary&quot; variant</HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/**
 * One-off gradient via the `style` prop. `backgroundColor` stays as the solid
 * fallback for clients that don't render the gradient (notably Outlook).
 */
export const GradientBackground: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton
                                href="https://example.com"
                                style={{
                                    backgroundColor: "#5B4FC7",
                                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B)",
                                    color: "#FFFFFF",
                                }}
                            >
                                Gradient button
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const HoverAndActiveState: Story = {
    render: () => {
        registerStyles(css`
            .interactiveButton a:hover {
                background-color: #3a2e9c !important;
            }
            .interactiveButton a:active {
                background-color: #eceafb !important;
                border-color: #5b4fc7 !important;
                color: #5b4fc7 !important;
            }
        `);

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlRaw>
                        <tr>
                            <td>
                                <HtmlButton
                                    href="https://example.com"
                                    className="interactiveButton"
                                    style={{ backgroundColor: "#5B4FC7", color: "#FFFFFF", border: "2px solid #5B4FC7" }}
                                >
                                    Hover and press me
                                </HtmlButton>
                            </td>
                        </tr>
                    </MjmlRaw>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

export const FullWidth: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton href="https://example.com" fullWidth>
                                Full-width button
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const FullWidthGradient: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton
                                href="https://example.com"
                                fullWidth
                                style={{
                                    backgroundColor: "#5B4FC7",
                                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B)",
                                    color: "#FFFFFF",
                                }}
                            >
                                Full-width gradient button
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const FullWidthOnMobile: Story = {
    render: () => {
        registerStyles(
            (theme) => css`
                ${theme.breakpoints.mobile.belowMediaQuery} {
                    .mobileFullWidth,
                    .mobileFullWidth table {
                        width: 100% !important;
                    }
                    .mobileFullWidth a {
                        display: block !important;
                        text-align: center !important;
                    }
                }
            `,
        );

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlRaw>
                        <tr>
                            <td>
                                <HtmlButton href="https://example.com" className="mobileFullWidth">
                                    Full width on mobile only
                                </HtmlButton>
                            </td>
                        </tr>
                    </MjmlRaw>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

/**
 * The button does not align itself; the containing cell does. Each button sits in its own
 * full-width row whose `align` attribute positions it left, center, or right.
 */
export const Alignment: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td align="left">
                            <HtmlButton href="https://example.com">Left</HtmlButton>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <TemporaryHtmlSpacer height="16px" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <HtmlButton href="https://example.com">Center</HtmlButton>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <TemporaryHtmlSpacer height="16px" />
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <HtmlButton href="https://example.com">Right</HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/**
 * Buttons sit side by side, each in its own cell of a single-row table, with a spacer cell
 * for the gap. The wrapper has no width, so it shrink-wraps and stays at the left.
 */
export const SideBySide: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                                <tbody>
                                    <tr>
                                        <td>
                                            <HtmlButton href="https://example.com">Button A</HtmlButton>
                                        </td>
                                        <td style={{ width: "16px", fontSize: "0", lineHeight: "0" }}>&nbsp;</td>
                                        <td>
                                            <HtmlButton href="https://example.com">Button B</HtmlButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const IconBeforeText: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td>
                            <HtmlButton href="https://example.com">
                                <table
                                    role="presentation"
                                    cellPadding={0}
                                    cellSpacing={0}
                                    border={0}
                                    style={{ display: "inline-block", verticalAlign: "middle" }}
                                >
                                    <tbody>
                                        <tr>
                                            <td valign="middle" style={{ paddingRight: "8px", fontSize: "0" }}>
                                                <img
                                                    src="https://picsum.photos/seed/buttonicon/18/18"
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                    style={{ display: "block" }}
                                                />
                                            </td>
                                            <td valign="middle" style={{ color: "#FFFFFF", textDecoration: "none" }}>
                                                Icon before text
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </HtmlButton>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
