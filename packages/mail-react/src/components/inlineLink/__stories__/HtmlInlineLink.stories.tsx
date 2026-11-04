import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlText } from "../../text/MjmlText.js";
import { HtmlInlineLink } from "../HtmlInlineLink.js";

type Story = StoryObj<typeof HtmlInlineLink>;

const config: Meta<typeof HtmlInlineLink> = {
    title: "Components/HtmlInlineLink",
    component: HtmlInlineLink,
    tags: ["autodocs"],
};

export default config;

export const InText: Story = {
    parameters: {
        theme: createTheme({
            text: {
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
                color: "#333333",
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlText>
                    Visit our <HtmlInlineLink href="https://example.com">website</HtmlInlineLink> for more information.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/**
 * Using `!important` overrides the component's responsive `inherit !important`
 * reset, ensuring the custom color persists on both desktop and mobile.
 */
export const CustomColorOverride: Story = {
    parameters: {
        theme: createTheme({
            text: {
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                color: "#333333",
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlText>
                    Click{" "}
                    <HtmlInlineLink href="https://example.com" style={{ color: "#0066cc !important" }}>
                        here
                    </HtmlInlineLink>{" "}
                    to continue.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const WithTextVariants: Story = {
    parameters: {
        theme: createTheme({
            text: {
                fontFamily: "Arial, sans-serif",
                color: "#333333",
                variants: {
                    heading: { fontSize: "32px", fontWeight: 700, lineHeight: "40px" },
                    body: { fontSize: "16px", lineHeight: "24px" },
                },
            },
        }),
    },
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlText variant="heading" bottomSpacing>
                    Welcome to <HtmlInlineLink href="https://example.com">our platform</HtmlInlineLink>
                </MjmlText>
                <MjmlText variant="body">
                    Explore our <HtmlInlineLink href="https://example.com/features">features</HtmlInlineLink> and start building today.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
