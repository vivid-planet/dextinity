import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlText } from "../../text/MjmlText.js";
import { MjmlWrapper } from "../MjmlWrapper.js";

type Story = StoryObj<typeof MjmlWrapper>;

const config: Meta<typeof MjmlWrapper> = {
    title: "Components/MjmlWrapper",
    component: MjmlWrapper,
    tags: ["autodocs"],
};

export default config;

export const Primary: Story = {
    render: (args) => (
        <MjmlWrapper {...args}>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText>Section content inside a wrapper with the default theme background</MjmlText>
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText>A second section; both share the wrapper's background</MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlWrapper>
    ),
};

export const ExplicitBackgroundColor: Story = {
    args: {
        backgroundColor: "#2d4a6e",
    },
    render: (args) => (
        <MjmlWrapper {...args}>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={20} />
                    <MjmlText color="#ffffff" bottomSpacing>
                        Explicit wrapper background; sections inside do not paint over it
                    </MjmlText>
                    <MjmlText color="#ffffff">A second section shares the wrapper background</MjmlText>
                    <MjmlSpacer height={20} />
                </MjmlColumn>
            </MjmlSection>
        </MjmlWrapper>
    ),
};

export const MultipleWrappersWithDifferentBackgrounds: Story = {
    render: (args) => (
        <>
            <MjmlWrapper {...args} backgroundColor="#8fa5bf">
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlSpacer height={20} />
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlText>Section content inside a wrapper with a different background #1</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlSpacer height={20} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlWrapper>
            <MjmlWrapper {...args} backgroundColor="#c0c1c4">
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={20} />
                        <MjmlText>Section content inside a wrapper with a different background #2</MjmlText>
                        <MjmlSpacer height={20} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlWrapper>
            <MjmlWrapper {...args} backgroundColor="#ffffff">
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={20} />
                        <MjmlText>Section content inside a wrapper with a different background #3</MjmlText>
                        <MjmlSpacer height={20} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlWrapper>
        </>
    ),
};

export const TransparentBackground: Story = {
    args: {
        backgroundColor: "transparent",
    },
    render: (args) => (
        <MjmlWrapper {...args}>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlSpacer height={20} />
                    <MjmlText>Transparent wrapper; the body background shows through</MjmlText>
                    <MjmlSpacer height={20} />
                </MjmlColumn>
            </MjmlSection>
        </MjmlWrapper>
    ),
};

export const FullWidth: Story = {
    args: {
        fullWidth: true,
        backgroundColor: "#2d4a6e",
    },
    render: (args) => (
        <MjmlWrapper {...args}>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText color="#ffffff">Full-width wrapper background extends edge-to-edge</MjmlText>
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText color="#ffffff">The section inside does not override the wrapper's background</MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlWrapper>
    ),
};
