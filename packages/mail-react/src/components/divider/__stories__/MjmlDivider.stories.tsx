import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlText } from "../../text/MjmlText.js";
import { MjmlWrapper } from "../../wrapper/MjmlWrapper.js";
import { MjmlDivider } from "../MjmlDivider.js";

type Story = StoryObj<typeof MjmlDivider>;

const config: Meta<typeof MjmlDivider> = {
    title: "Components/MjmlDivider",
    component: MjmlDivider,
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
                <MjmlDivider {...args} />
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
                <MjmlDivider {...args} />
                <MjmlSpacer height="16px" />
                <MjmlDivider {...args} variant="thick" />
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

const columnClassName = "mjmlDividerStory__column";

/**
 * A divider must not break the row it sits in. The three colored columns stay side by side; if the
 * divider's table broke out of its cell, the parser would close the group and section early and the
 * column after it would stack below instead.
 */
export const StaysInsideANonStackingRow: Story = {
    render: (args) => (
        <MjmlSection indent disableResponsiveBehavior>
            <MjmlColumn className={columnClassName} backgroundColor="#cfe3f5">
                <MjmlText>First</MjmlText>
            </MjmlColumn>
            <MjmlColumn className={columnClassName} backgroundColor="#f5e6cf">
                <MjmlText>Second</MjmlText>
                <MjmlDivider {...args} />
            </MjmlColumn>
            <MjmlColumn className={columnClassName} backgroundColor="#d9f5cf">
                <MjmlText>Third</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
    play: async ({ canvasElement }) => {
        const columns = canvasElement.querySelectorAll(`.${columnClassName}`);
        await expect(columns).toHaveLength(3);

        const containingCells = new Set([...columns].map((column) => column.closest("td")));
        await expect(containingCells.size).toBe(1);
    },
};

const wrapperClassName = "mjmlDividerStory__wrapper";

/**
 * A wrapper's background has to span every section inside it, including ones after a divider. If the
 * divider's table broke out of its cell, the section after it would render outside the wrapper
 * instead of on its background.
 */
export const KeepsTheWrapperBackground: Story = {
    render: (args) => (
        <MjmlWrapper className={wrapperClassName} backgroundColor="#2d4a6e">
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height="16px" />
                    <MjmlText color="#ffffff">Above the divider</MjmlText>
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlDivider {...args} backgroundColor="#ffffff" />
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText color="#ffffff">After the divider</MjmlText>
                    <MjmlSpacer height="16px" />
                </MjmlColumn>
            </MjmlSection>
        </MjmlWrapper>
    ),
    play: async ({ canvasElement }) => {
        const wrapper = canvasElement.querySelector(`.${wrapperClassName}`);
        await expect(wrapper).not.toBeNull();
        await expect(wrapper).toHaveTextContent("After the divider");
    },
};
