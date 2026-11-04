import { MjmlColumn, MjmlText } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { createTheme } from "../../../theme/createTheme.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlMailRoot } from "../MjmlMailRoot.js";

type Story = StoryObj<typeof MjmlMailRoot>;

const config: Meta<typeof MjmlMailRoot> = {
    title: "Components/MjmlMailRoot",
    component: MjmlMailRoot,
    tags: ["autodocs"],
    parameters: { mailRoot: false },
};

export default config;

export const Basic: Story = {
    render: () => (
        <MjmlMailRoot>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText>Hello from MjmlMailRoot</MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};

export const CustomBodyBackground: Story = {
    render: () => (
        <MjmlMailRoot theme={createTheme({ colors: { background: { body: "#EAEAEA" } } })}>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText>Custom body background color</MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};
