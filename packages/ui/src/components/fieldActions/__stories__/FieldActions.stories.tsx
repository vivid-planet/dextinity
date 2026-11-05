import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Input } from "../../input/Input";
import { Textarea } from "../../textarea/Textarea";
import fieldActionsTokens from "../_tokens.scss?raw";
import { FieldActions, type FieldActionsProps } from "../FieldActions";
import styles from "./FieldActions.stories.module.scss";

function suggest(text: string) {
    return () => new Promise<string>((resolve) => setTimeout(() => resolve(text), 600));
}

function AltTextField(props: FieldActionsProps) {
    const [value, setValue] = useState("Three people at a table in the office.");
    return (
        <Textarea
            name="altText"
            label="Alt text"
            rows={2}
            helperText="Per language."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            actions={
                <FieldActions
                    {...props}
                    onAiAccept={(suggestion) => {
                        props.onAiAccept?.(suggestion);
                        setValue(suggestion);
                    }}
                />
            }
        />
    );
}

const meta = {
    component: FieldActions,
    title: "Building blocks/Form fields/FieldActions",
    decorators: [themeDecorator],
    parameters: { tokens: fieldActionsTokens },
    render: (args) => <AltTextField {...args} />,
    args: {
        translate: true,
        aiAssist: true,
        targetLocales: ["en", "fr"],
        onTranslate: fn(),
        onAiSuggest: fn(suggest("Three colleagues discuss a design draft at a bright office table.")),
        onAiAccept: fn(),
        onAiError: fn(),
    },
    argTypes: {
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof FieldActions>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Translate and AI sit at the label and become fully opaque on hover or focus. While the suggestion loads, the field shows a
 * spinner; the suggestion then appears below the field to accept or discard.
 *
 * **Rules**
 * - A person accepts a suggestion; it is never applied automatically.
 * - Offer the actions only where they make sense (text per language, alt text, SEO), not at every field.
 * - Translations are created unpublished.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await expect(args.onTranslate).toHaveBeenCalledWith(["en", "fr"]);

        await userEvent.click(canvas.getByRole("button", { name: "Improve with AI" }));
        await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
        const accept = await canvas.findByRole("button", { name: "Accept" });
        await waitFor(() => expect(canvas.getByRole("group", { name: "AI suggestion" })).toHaveFocus());
        await userEvent.click(accept);
        await expect(args.onAiAccept).toHaveBeenCalledWith("Three colleagues discuss a design draft at a bright office table.");
        await expect(canvas.getByRole("textbox")).toHaveValue("Three colleagues discuss a design draft at a bright office table.");
        await expect(canvas.queryByRole("group", { name: "AI suggestion" })).toBeNull();
        await expect(canvas.getByRole("textbox")).toHaveFocus();
    },
};

export const TranslateOnly: Story = {
    args: {
        aiAssist: false,
    },
};

export const AiOnly: Story = {
    args: {
        translate: false,
    },
};

/**
 * Discarding removes the suggestion and keeps the value. Accepting or discarding returns focus to the field.
 */
export const Discard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Improve with AI" }));
        await userEvent.click(await canvas.findByRole("button", { name: "Discard" }));
        await expect(args.onAiAccept).not.toHaveBeenCalled();
        await expect(canvas.getByRole("textbox")).toHaveFocus();
        await expect(canvas.getByRole("textbox")).toHaveValue("Three people at a table in the office.");
    },
};

/**
 * When `onAiSuggest` fails, the loading state ends and `onAiError` receives the error.
 */
export const SuggestionFails: Story = {
    args: {
        onAiSuggest: fn(() => Promise.reject(new globalThis.Error("Service unavailable"))),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Improve with AI" }));
        await waitFor(() => expect(args.onAiError).toHaveBeenCalled());
        await expect(canvas.getByRole("textbox")).not.toHaveAttribute("aria-busy");
        await expect(canvas.getByRole("button", { name: "Improve with AI" })).toHaveFocus();
    },
};

/**
 * The actions work on any field: here an input with a counter.
 */
export const OnInput: Story = {
    render: (args) => (
        <div className={styles.form}>
            <Input
                name="metaTitle"
                label="Meta title"
                value="Open positions · Example Inc."
                maxLength={60}
                showCount
                helperText="Recommended: up to 60 characters."
                onChange={fn()}
                actions={<FieldActions {...args} />}
            />
        </div>
    ),
};
