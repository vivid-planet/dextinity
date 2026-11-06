import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { SaveState } from "../../saveState/SaveState";
import { TopBar, type TopBarProps } from "../TopBar";
import topBarTokens from "../TopBar.tokens.scss?raw";
import styles from "./TopBar.stories.module.scss";
import { StoryScopeSwitcher, StoryUserMenu } from "./topBarStoryParts";

function ControlledTopBar(props: TopBarProps) {
    const [aiOpen, setAiOpen] = useState(props.aiOpen ?? false);
    return (
        <TopBar
            {...props}
            aiOpen={aiOpen}
            onAiOpenChange={
                props.onAiOpenChange == null
                    ? undefined
                    : (nextOpen) => {
                          setAiOpen(nextOpen);
                          props.onAiOpenChange?.(nextOpen);
                      }
            }
        />
    );
}

const editActions = (
    <>
        <SaveState state="dirty" />
        <IconButton variant="text" color="secondary" aria-label="Preview">
            <Icon name="visible" />
        </IconButton>
        <IconButton variant="text" color="secondary" aria-label="More actions">
            <Icon name="more-horizontal" />
        </IconButton>
        <Button startIcon={<Icon name="check" />}>Save</Button>
    </>
);

const meta = {
    component: TopBar,
    title: "Shell/Top bar & scope/TopBar",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: topBarTokens, layout: "fullscreen" },
    render: (args) => <ControlledTopBar {...args} />,
    args: {
        onSearchClick: fn(),
        scope: <StoryScopeSwitcher />,
        onAiOpenChange: fn(),
        userMenu: <StoryUserMenu />,
    },
    argTypes: {
        mode: { control: "radio", options: ["browse", "edit"] },
        aiOpen: { control: "boolean" },
        scope: { control: false },
        userMenu: { control: false },
        actions: { control: false },
        back: { control: false },
        title: { control: "text" },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Search at the start opens the command palette; scope, AI toggle, and user menu at the end.
 *
 * **Rules**
 *
 * - One top bar for the whole app; screens don't add their own.
 * - The scope is always visible and lives only here.
 * - Never show the app name in the top bar; it belongs in the navigation.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Search, jump, create …" }));
        await waitFor(() => expect(args.onSearchClick).toHaveBeenCalled());
        const aiToggle = canvas.getByRole("switch", { name: "AI assistant" });
        await userEvent.click(aiToggle);
        await waitFor(() => expect(args.onAiOpenChange).toHaveBeenLastCalledWith(true));
        await expect(aiToggle).toHaveAttribute("aria-checked", "true");
    },
};

export const AiOpen: Story = {
    args: {
        aiOpen: true,
    },
};

/**
 * While editing, back, what is edited, and the editing actions replace search and toggles. Save is the bar's only primary action. A
 * page sets them with `useTopBarEdit`, see the `AppShell`'s `EditingPage` story.
 */
export const Edit: Story = {
    args: {
        mode: "edit",
        back: { label: "Back to job ads", onClick: fn() },
        title: "Frontend developer",
        actions: editActions,
    },
};

/**
 * On narrow bars the AI toggle loses its text and the search becomes an icon; the scope shows its short form, then only the icon. On
 * narrow windows, `onMenuClick` shows the menu button that opens the navigation.
 */
export const Narrow: Story = {
    args: {
        onMenuClick: fn(),
    },
    decorators: [
        (Story) => (
            <div className={styles.narrow}>
                <Story />
            </div>
        ),
    ],
};
