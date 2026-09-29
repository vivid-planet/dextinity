import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { registerStyles } from "../../../styles/registerStyles.js";
import { createTheme } from "../../../theme/createTheme.js";
import { css } from "../../../utils/css.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlButton } from "../MjmlButton.js";

type Story = StoryObj<typeof MjmlButton>;

const config: Meta<typeof MjmlButton> = {
    title: "Components/MjmlButton",
    component: MjmlButton,
    tags: ["autodocs"],
    args: {
        href: "https://example.com",
        children: "Click me",
    },
    argTypes: {
        variant: { control: "text" },
        fullWidth: { control: "boolean" },
        align: { control: "inline-radio", options: ["left", "center", "right"] },
        href: { control: "text" },
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlButton {...args} />
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
                <MjmlButton href="https://example.com">Primary (default)</MjmlButton>
                <MjmlSpacer height="16px" />
                <MjmlButton href="https://example.com" variant="secondary">
                    Secondary
                </MjmlButton>
                <MjmlSpacer height="16px" />
                <MjmlButton href="https://example.com" variant="tertiary">
                    Tertiary
                </MjmlButton>
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
                <MjmlButton href="https://example.com" variant="primary">
                    Shrinks on mobile
                </MjmlButton>
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
                <MjmlButton href="https://example.com">Uses the default &quot;primary&quot; variant</MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/**
 * `backgroundColor` is the solid fallback for clients that don't render the
 * gradient (notably Outlook). The gradient overlay comes from the `gradientButton` class.
 */
export const GradientBackground: Story = {
    render: () => {
        registerStyles(css`
            .gradientButton a {
                background-image: linear-gradient(to right, #5b4fc7, #ff6b6b) !important;
            }
        `);

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlButton href="https://example.com" backgroundColor="#5B4FC7" color="#FFFFFF" className="gradientButton">
                        Gradient button
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>
        );
    },
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
                    <MjmlButton
                        href="https://example.com"
                        backgroundColor="#5B4FC7"
                        color="#FFFFFF"
                        border="2px solid #5B4FC7"
                        className="interactiveButton"
                    >
                        Hover and press me
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

export const FullWidth: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlButton href="https://example.com" fullWidth>
                    Full-width button
                </MjmlButton>
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
                    <MjmlButton href="https://example.com" className="mobileFullWidth">
                        Full width on mobile only
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

export const Alignment: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlButton href="https://example.com" align="left">
                    Left
                </MjmlButton>
                <MjmlSpacer height="16px" />
                <MjmlButton href="https://example.com" align="center">
                    Center
                </MjmlButton>
                <MjmlSpacer height="16px" />
                <MjmlButton href="https://example.com" align="right">
                    Right
                </MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const FullWidthGradient: Story = {
    render: () => {
        registerStyles(css`
            .gradientButton a {
                background-image: linear-gradient(to right, #5b4fc7, #ff6b6b) !important;
            }
        `);

        return (
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlButton href="https://example.com" backgroundColor="#5B4FC7" color="#FFFFFF" className="gradientButton" fullWidth>
                        Full-width gradient button
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>
        );
    },
};

export const IconBeforeText: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlButton href="https://example.com">
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
                </MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    ),
};
