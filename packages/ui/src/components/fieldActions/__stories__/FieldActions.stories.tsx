import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Field } from "../../field/Field";
import { Input } from "../../input/Input";
import { Textarea } from "../../textarea/Textarea";
import { FieldActions, type FieldActionsProps } from "../FieldActions";
import fieldActionsTokens from "../FieldActions.tokens.scss?raw";
import styles from "./FieldActions.stories.module.scss";

function MetaTitleField(props: FieldActionsProps) {
    const [value, setValue] = useState("Open positions · Example Inc.");
    const maxLength = 60;
    return (
        <Field
            label="Meta title"
            helperText="Recommended: up to 60 characters."
            counter={`${value.length} / ${maxLength}`}
            actions={<FieldActions {...props} />}
        >
            <Input name="metaTitle" value={value} maxLength={maxLength} onChange={(event) => setValue(event.target.value)} />
        </Field>
    );
}

function suggest(text: string) {
    return () => new Promise<string>((resolve) => setTimeout(() => resolve(text), 600));
}

const translationFailedMessage = "Translation failed. Try again.";

/** Shows a failed translation in the field's validation message until the next translation or input. */
function AltTextField(props: FieldActionsProps) {
    const [value, setValue] = useState("Three people at a table in the office.");
    const [translationFailed, setTranslationFailed] = useState(false);
    return (
        <Field
            label="Alt text"
            helperText="Per language."
            state={translationFailed ? "error" : "default"}
            validationMessage={translationFailed ? translationFailedMessage : undefined}
            actions={
                <FieldActions
                    {...props}
                    onTranslate={(targetLocales) => {
                        setTranslationFailed(false);
                        return props.onTranslate?.(targetLocales);
                    }}
                    onTranslateError={(error) => {
                        props.onTranslateError?.(error);
                        setTranslationFailed(true);
                    }}
                    onAiAccept={(suggestion) => {
                        props.onAiAccept?.(suggestion);
                        setValue(suggestion);
                    }}
                    onTranslateAccept={(translation) => {
                        props.onTranslateAccept?.(translation);
                        setValue(translation);
                    }}
                />
            }
        >
            <Textarea
                name="altText"
                rows={2}
                value={value}
                onChange={(event) => {
                    setTranslationFailed(false);
                    setValue(event.target.value);
                }}
            />
        </Field>
    );
}

function translateToGerman(text: string) {
    return new Promise<string>((resolve) =>
        setTimeout(() => resolve(text === "Three people at a table in the office." ? "Drei Personen an einem Tisch im Büro." : text), 600),
    );
}

/**
 * Translates in place with a single click, like cms-admin's content translation service: no target locales, the handler sets the value.
 */
function TranslatedInPlaceField(props: FieldActionsProps) {
    const [value, setValue] = useState("Three people at a table in the office.");
    return (
        <Field
            label="Alt text"
            actions={
                <FieldActions
                    {...props}
                    onTranslate={async (targetLocales) => {
                        props.onTranslate?.(targetLocales);
                        setValue(await translateToGerman(value));
                    }}
                />
            }
        >
            <Textarea name="altText" rows={2} value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
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
        onTranslateError: fn(),
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
 * spinner; the suggestion then appears below the field to accept or discard. Pass the actions to the field:
 * `<Field label="Alt text" actions={<FieldActions translate aiAssist … />}><Textarea … /></Field>`.
 *
 * **Rules**
 * - A person accepts a suggestion; it is never applied automatically.
 * - Offer the actions only where they make sense (text per language, alt text, SEO), not at every field.
 * - Translations are created unpublished.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(args.onTranslate).toHaveBeenCalledWith(["en", "fr"]));

        await userEvent.click(canvas.getByRole("button", { name: "Improve with AI" }));
        await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
        const accept = await canvas.findByRole("button", { name: "Accept" });
        await waitFor(() => expect(canvas.getByRole("group", { name: "AI suggestion" })).toHaveFocus());
        await userEvent.click(accept);
        await waitFor(() => expect(args.onAiAccept).toHaveBeenCalledWith("Three colleagues discuss a design draft at a bright office table."));
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
 * When the promise of `onTranslate` rejects, the loading state ends and `onTranslateError` receives the error. `FieldActions` shows no
 * error itself: the application handles `onTranslateError`, here by setting the surrounding field's `state="error"` and
 * `validationMessage` ("Translation failed. Try again.") until the next translation or input.
 *
 * Focus stays on "Translate", and the field's message is no live region, so a screen reader doesn't announce the failure on its own:
 * the application announces it as well, e.g. with an error toast.
 */
export const TranslationFails: Story = {
    args: {
        onTranslate: fn(() => new Promise((_resolve, reject) => setTimeout(() => reject(new globalThis.Error("Service unavailable")), 300))),
    },
    play: async ({ args, canvas }) => {
        const textbox = canvas.getByRole("textbox", { name: "Alt text" });
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(args.onTranslateError).toHaveBeenCalledTimes(1));
        await expect(textbox).not.toHaveAttribute("aria-busy");
        await expect(canvas.getByRole("button", { name: "Translate" })).toHaveFocus();
        await expect(textbox).toHaveAttribute("aria-invalid", "true");
        await expect(textbox).toHaveAccessibleDescription("Translation failed. Try again.");

        await userEvent.type(textbox, " ");
        await expect(textbox).not.toHaveAttribute("aria-invalid");
        await expect(textbox).toHaveAccessibleDescription("Per language.");

        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(args.onTranslateError).toHaveBeenCalledTimes(2));
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await expect(textbox).not.toHaveAttribute("aria-invalid");
        await expect(textbox).toHaveAccessibleDescription("Per language.");
        await waitFor(() => expect(args.onTranslateError).toHaveBeenCalledTimes(3));
        await expect(textbox).toHaveAccessibleDescription("Translation failed. Try again.");
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
            <MetaTitleField {...args} />
        </div>
    ),
};

/**
 * Without `targetLocales`, "Translate" is a single click that translates the field's content in place, e.g. with cms-admin's content
 * translation service. Return a promise from `onTranslate` to show the field as loading until the translation is set.
 */
export const TranslateInPlace: Story = {
    args: { aiAssist: false, targetLocales: undefined },
    render: (args) => <TranslatedInPlaceField {...args} />,
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await expect(args.onTranslate).toHaveBeenCalledWith([]);
        await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
        await waitFor(() => expect(canvas.getByRole("textbox")).toHaveValue("Drei Personen an einem Tisch im Büro."));
        await waitFor(() => expect(canvas.getByRole("textbox")).not.toHaveAttribute("aria-busy"));
    },
};

/**
 * With `onTranslateSuggest`, the translation is offered to accept or discard, like an AI suggestion, e.g. for cms-admin's content
 * translation service with `showApplyTranslationDialog`.
 */
export const ReviewTranslation: Story = {
    args: {
        aiAssist: false,
        targetLocales: undefined,
        onTranslateSuggest: fn(() => translateToGerman("Three people at a table in the office.")),
        onTranslateAccept: fn(),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        const translation = await canvas.findByRole("group", { name: "Translation" });
        await expect(translation).toHaveTextContent("Drei Personen an einem Tisch im Büro.");
        await expect(args.onTranslate).not.toHaveBeenCalled();
        await userEvent.click(canvas.getByRole("button", { name: "Accept" }));
        await waitFor(() => expect(args.onTranslateAccept).toHaveBeenCalledWith("Drei Personen an einem Tisch im Büro."));
        await expect(canvas.getByRole("textbox")).toHaveValue("Drei Personen an einem Tisch im Büro.");
    },
};
