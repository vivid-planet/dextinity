
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import aiPanelTokens from "../_tokens.scss?raw";
import { AIPanel, type AIPanelMessage, type AIPanelProps } from "../AIPanel";
import styles from "./AIPanel.stories.module.scss";

const greeting: AIPanelMessage = {
    id: "greeting",
    role: "assistant",
    content: "I know the content in the scope Austria · German. Ask me something or pick a suggestion.",
};

const conversation: AIPanelMessage[] = [
    greeting,
    { id: "question", role: "user", content: "What is unpublished?" },
    {
        id: "answer",
        role: "assistant",
        content: "4 pages are unpublished, 3 of them below Careers. The oldest draft is from March.",
        actions: [
            { label: "Apply filter", onClick: fn() },
            { label: "Open Careers", onClick: fn() },
        ],
    },
];

function ControlledAIPanel(props: AIPanelProps) {
    const [open, setOpen] = useState(props.open);
    const [value, setValue] = useState(props.value);
    const [messages, setMessages] = useState(props.messages);
    return (
        <AIPanel
            {...props}
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                props.onOpenChange(nextOpen);
            }}
            value={value}
            onValueChange={(nextValue) => {
                setValue(nextValue);
                props.onValueChange(nextValue);
            }}
            messages={messages}
            onSend={(prompt) => {
                setMessages((current) => [...current, { id: `${current.length}`, role: "user", content: prompt }]);
                setValue("");
                props.onSend(prompt);
            }}
        />
    );
}

const meta = {
    component: AIPanel,
    title: "Shell/AI assistant/AIPanel",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: aiPanelTokens, layout: "fullscreen" },
    render: (args) => <ControlledAIPanel {...args} />,
    args: {
        open: true,
        onOpenChange: fn(),
        context: "Page tree · Austria · German",
        messages: [greeting],
        suggestions: [
            { label: "What is unpublished?", prompt: "What is unpublished?" },
            { label: "Check structure", prompt: "Check the page structure for problems." },
        ],
        value: "",
        onValueChange: fn(),
        onSend: fn(),
    },
    argTypes: {
        pending: { control: "boolean" },
        messages: { control: false },
        suggestions: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof AIPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Title and context at the top, the conversation, suggestions that fit the screen, and the input. Enter sends, Shift+Enter adds a line.
 *
 * **Rules**
 *
 * - Always show the context.
 * - Offer answers as actions the person checks; never change or publish content without confirmation.
 * - Mark AI-generated content until a person takes it over.
 * - Don't make the assistant the only way to reach a feature.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Ask the assistant …" });
        await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
        await userEvent.type(input, "Which job ads expire this week?");
        await userEvent.keyboard("{Enter}");
        await expect(args.onSend).toHaveBeenLastCalledWith("Which job ads expire this week?");
        await expect(input).toHaveValue("");

        await userEvent.click(canvas.getByRole("button", { name: "Check structure" }));
        await expect(args.onSend).toHaveBeenLastCalledWith("Check the page structure for problems.");

        await userEvent.click(canvas.getByRole("button", { name: "Close AI assistant" }));
        await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    },
};

/**
 * Answers offer actions, e.g. setting a filter; the person decides.
 */
export const Conversation: Story = {
    args: {
        messages: conversation,
        suggestions: undefined,
    },
};

/**
 * The typing indicator while the answer is prepared.
 */
export const Pending: Story = {
    args: {
        messages: conversation.slice(0, 2),
        pending: true,
        suggestions: undefined,
        note: "AI answers can be wrong. Check them before you act.",
    },
};
