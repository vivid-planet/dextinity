import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { StoryScopeSwitcher, StoryUserMenu } from "../../topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../topBar/TopBar";
import { AiAssistantSwitch } from "../AiAssistantSwitch";

const meta = {
    component: AiAssistantSwitch,
    title: "Shell/Top bar & scope/AiAssistantSwitch",
    decorators: [themeDecorator],
    tags: ["forced-colors"],
    args: {
        checked: false,
        onChange: fn(),
    },
    argTypes: {
        checked: { control: "boolean" },
        iconOnly: { control: "boolean" },
        icon: {
            control: "select",
            options: ["Spark", "Magic wand"],
            mapping: { Spark: <Icon name="spark" />, "Magic wand": <Icon name="magic-wand" /> },
        },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => {
        const [checked, setChecked] = useControlledArg(args, "checked", context);
        return (
            <AiAssistantSwitch
                {...args}
                checked={checked}
                onChange={(next) => {
                    args.onChange?.(next);
                    setChecked(next);
                }}
            />
        );
    },
} satisfies Meta<typeof AiAssistantSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Shows and hides the AI assistant. The mini switch shows the state at all times; ⌘J / Ctrl+J appears only in the tooltip.
 *
 * **Rules**
 *
 * - One switch, in the top bar after the scope. Inside `AppShell`, it follows the shell's assistant without props.
 * - Leave it out for users without the right to use the assistant.
 * - Keep the AI icon in one place of the app, as it may still change.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const control = canvas.getByRole("switch", { name: "AI assistant" });
        await expect(control).toHaveAttribute("aria-checked", "false");
        await expect(control).toHaveAttribute("aria-keyshortcuts");
        await userEvent.click(control);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
        await expect(control).toHaveAttribute("aria-checked", "true");
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false));
        await userEvent.hover(control);
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("AI assistant");
    },
};

/**
 * On: the accent fill and a solid accent track, never the brand gradient. In forced colors, the track is drawn in the highlight color.
 */
export const Checked: Story = {
    args: { checked: true },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("switch", { name: "AI assistant" });
        await expect(control).toHaveAttribute("aria-checked", "true");
        if (!window.matchMedia("(forced-colors: active)").matches) {
            return;
        }
        const track = control.querySelector(".dextinityAiAssistantSwitch__track");
        await expect(getComputedStyle(control).outlineStyle).toBe("solid");
        await expect(track != null && getComputedStyle(track).outlineStyle).toBe("solid");
    },
};

/**
 * Only the icon and the mini switch, e.g. on narrow windows, where `AppShell` sets it. The label stays the accessible name.
 */
export const IconOnly: Story = {
    args: { iconOnly: true },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("switch", { name: "AI assistant" })).toBeInTheDocument();
        await expect(canvas.getByText("AI assistant")).not.toBeVisible();
    },
};

/**
 * `labels` sets the texts, e.g. in German.
 */
export const CustomLabel: Story = {
    args: { labels: { label: "AI-Assistent" } },
};

/**
 * In the top bar, the switch sits after the scope and looks like it: the same surface, edge, height, and hover.
 */
export const InTopBar: Story = {
    parameters: { layout: "fullscreen", controls: { disable: true } },
    render: (args, context) => {
        const [checked, setChecked] = useControlledArg(args, "checked", context);
        return (
            <div style={{ padding: 24 }}>
                <TopBar
                    onSearchClick={fn()}
                    scope={<StoryScopeSwitcher />}
                    assistantSwitch={
                        <AiAssistantSwitch
                            checked={checked}
                            onChange={(next) => {
                                args.onChange?.(next);
                                setChecked(next);
                            }}
                        />
                    }
                    userMenu={<StoryUserMenu />}
                />
            </div>
        );
    },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("switch", { name: "AI assistant" });
        const scope = canvas.getByRole("banner").querySelector(".dextinityScopeSwitcher");
        await expect(scope != null && scope.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        await expect(getComputedStyle(control).blockSize).toBe(getComputedStyle(scope as Element).blockSize);
    },
};
