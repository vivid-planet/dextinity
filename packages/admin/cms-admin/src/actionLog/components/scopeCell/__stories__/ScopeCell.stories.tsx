import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScopeCell } from "../ScopeCell";

type Story = StoryObj<typeof ScopeCell>;
const meta: Meta<typeof ScopeCell> = {
    component: ScopeCell,
    title: "actionLog/components/scopeCell/ScopeCell",
};
export default meta;

export const SingleScope: Story = {
    args: {
        scopes: [{ domain: "main", language: "en" }],
    },
};

export const MultipleScopes: Story = {
    args: {
        scopes: [
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
            { domain: "secondary", language: "en" },
        ],
    },
};

export const GlobalScope: Story = {
    args: {
        scopes: null,
    },
};
