import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Textarea } from "../../textarea/Textarea";
import { TextField } from "../../textField/TextField";
import { FieldActions, type FieldActionsProps } from "../FieldActions";
import fieldActionsTokens from "../FieldActions.tokens.scss?raw";
import styles from "./FieldActions.stories.module.scss";

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
                    onTranslateAccept={(translation) => {
                        props.onTranslateAccept?.(translation);
                        setValue(translation);
                    }}
                />
            }
        />
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
        <Textarea
            name="altText"
            label="Alt text"
            rows={2}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            actions={
                <FieldActions
                    {...props}
                    onTranslate={async (targetLocales) => {
                        props.onTranslate?.(targetLocales);
                        setValue(await translateToGerman(value));
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
 * Translate sits at the label and becomes fully opaque on hover or focus.
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
 * When the promise of `onTranslate` rejects, the loading state ends and `onTranslateError` receives the error.
 */
export const TranslationFails: Story = {
    args: {
        onTranslate: fn(() => Promise.reject(new globalThis.Error("Service unavailable"))),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Translate" }));
        await waitFor(() => expect(args.onTranslateError).toHaveBeenCalled());
        await expect(canvas.getByRole("textbox")).not.toHaveAttribute("aria-busy");
        await expect(canvas.getByRole("button", { name: "Translate" })).toHaveFocus();
    },
};

/**
 * The actions work on any field: here an input with a counter.
 */
export const OnInput: Story = {
    render: (args) => (
        <div className={styles.form}>
            <TextField
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
