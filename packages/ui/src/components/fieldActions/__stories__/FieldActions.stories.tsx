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
        targetLocales: ["en", "fr"],
        onTranslate: fn(),
        onTranslateError: fn(),
    },
    argTypes: {
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof FieldActions>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Translate sits at the label and becomes fully opaque on hover or focus. Pass the actions to the field:
 * `<Field label="Alt text" actions={<FieldActions translate … />}><Textarea … /></Field>`.
 *
 * **Rules**
 * - Offer translation only for fields with content per language, not at every field.
 * - Translations are created unpublished.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(args.onTranslate).toHaveBeenCalledWith(["en", "fr"]));
    },
};

/**
 * When the promise of `onTranslate` rejects, the loading state ends and `onTranslateError` receives the error. `FieldActions` shows no
 * error itself: the application handles `onTranslateError`, here by setting the surrounding field's `state="error"` and
 * `validationMessage` ("Translation failed. Try again.") until the next translation or input.
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
    args: { targetLocales: undefined },
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
 * With `onTranslateSuggest`, the translation is offered to accept or discard, e.g. for cms-admin's content translation service with
 * `showApplyTranslationDialog`. A person accepts the translation; it is never applied automatically. Accepting or discarding returns
 * focus to the field.
 */
export const ReviewTranslation: Story = {
    args: {
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
        await expect(canvas.getByRole("textbox")).toHaveFocus();
    },
};

/**
 * Discarding removes the translation and keeps the value.
 */
export const DiscardTranslation: Story = {
    args: {
        targetLocales: undefined,
        onTranslateSuggest: fn(() => translateToGerman("Three people at a table in the office.")),
        onTranslateAccept: fn(),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(canvas.getByRole("group", { name: "Translation" })).toHaveFocus());
        await userEvent.click(canvas.getByRole("button", { name: "Discard" }));
        await expect(args.onTranslateAccept).not.toHaveBeenCalled();
        await expect(canvas.queryByRole("group", { name: "Translation" })).toBeNull();
        await expect(canvas.getByRole("textbox")).toHaveFocus();
        await expect(canvas.getByRole("textbox")).toHaveValue("Three people at a table in the office.");
    },
};
