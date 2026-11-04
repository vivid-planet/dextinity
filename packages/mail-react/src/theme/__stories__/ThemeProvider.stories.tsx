import { MjmlColumn, MjmlText } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../components/section/MjmlSection.js";
import { createBreakpoint } from "../createBreakpoint.js";
import { createTheme } from "../createTheme.js";
import { ThemeProvider } from "../ThemeProvider.js";

type Story = StoryObj<typeof ThemeProvider>;

const config: Meta<typeof ThemeProvider> = {
    title: "Components/ThemeProvider",
    component: ThemeProvider,
    tags: ["autodocs"],
};

export default config;

export const Basic: Story = {
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Using the default theme from the decorator.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};

const narrowTheme = createTheme({
    sizes: { bodyWidth: 400 },
    breakpoints: { mobile: createBreakpoint(360) },
});

export const CustomTheme: Story = {
    parameters: { theme: narrowTheme },
    render: () => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>This email uses a 400px body width and 360px mobile breakpoint.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
};
