import { MjmlColumn, MjmlText } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../MjmlSection.js";

type Story = StoryObj<typeof MjmlSection>;

const config: Meta<typeof MjmlSection> = {
    title: "Components/MjmlSection",
    component: MjmlSection,
    tags: ["autodocs"],
};

export default config;

export const Primary: Story = {
    render: (args) => (
        <MjmlSection {...args}>
            <MjmlColumn>
                <MjmlText>Section content</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const Indented: Story = {
    args: {
        indent: true,
    },
    render: (args) => (
        <MjmlSection {...args}>
            <MjmlColumn>
                <MjmlText>Indented section content</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const ExplicitBackgroundColor: Story = {
    args: {
        backgroundColor: "#FF0000",
    },
    render: (args) => (
        <MjmlSection {...args}>
            <MjmlColumn>
                <MjmlText>Explicit backgroundColor overrides theme default</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const DisabledResponsiveBehavior: Story = {
    args: {
        disableResponsiveBehavior: true,
    },
    render: (args) => (
        <MjmlSection {...args}>
            <MjmlColumn>
                <MjmlText>First column</MjmlText>
            </MjmlColumn>
            <MjmlColumn>
                <MjmlText>Second column</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
