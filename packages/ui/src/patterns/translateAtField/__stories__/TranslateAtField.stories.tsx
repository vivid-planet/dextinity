import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import { Field } from "../../../components/field/Field";
import { FieldActions } from "../../../components/fieldActions/FieldActions";
import { Input } from "../../../components/input/Input";
import { Textarea } from "../../../components/textarea/Textarea";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { PatternExample, PatternPage, PatternRules, PatternSection, PatternSteps, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./TranslateAtField.stories.module.scss";

const localeNames: Record<string, string> = { de: "German", fr: "French" };

function FieldsExample() {
    const [metaTitle, setMetaTitle] = useState("Open positions · Example Ltd");
    const [altText, setAltText] = useState("Three people working at a table in the office.");
    const { toasts, add, dismiss } = useToasts();

    const translate = (fieldName: string) => (targetLocales: string[]) =>
        add({
            message: `${fieldName} translated into ${targetLocales.map((locale) => localeNames[locale]).join(" and ")} · created unpublished`,
        });

    return (
        <PatternExample>
            <div className={styles.fields}>
                <Field
                    label="Meta title"
                    helperText="Recommended: up to 60 characters."
                    actions={<FieldActions translate targetLocales={["de", "fr"]} onTranslate={translate("Meta title")} />}
                >
                    <Input name="metaTitle" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
                </Field>
                <Field
                    label="Alt text"
                    helperText="Per language."
                    actions={<FieldActions translate targetLocales={["de", "fr"]} onTranslate={translate("Alt text")} />}
                >
                    <Textarea name="altText" rows={2} value={altText} onChange={(event) => setAltText(event.target.value)} />
                </Field>
            </div>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

function TranslateAtFieldPage() {
    return (
        <PatternPage>
            <PatternSection title="Example" description="Hover or focus a field: Translate at the label.">
                <FieldsExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Trigger", description: "At the label, only for fields with content per language (text, alt text, SEO)." },
                    { title: "Translate", description: "Into other scopes: creates the content unpublished." },
                    { title: "Confirm", description: "A toast names the languages and says the content is unpublished." },
                ]}
            />
            <PatternUses pages={["Form fields", "Menus & messages"]} />
            <PatternRules
                dos={["Translations are created unpublished.", "Say which languages the content was translated into."]}
                donts={["Translate buttons at fields without content per language.", "Publishing translations automatically."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Translation at the field",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component: "Translation right at the field. `FieldActions` in a field's `actions` adds Translate to the label.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: create translations unpublished; say which languages the content was translated into.
 * - Don't: put translate buttons at fields without content per language; publish translations automatically.
 */
export const Default: Story = {
    render: () => <TranslateAtFieldPage />,
};

/**
 * Translating creates the content unpublished in the other scopes, and the toast says so.
 */
export const Translate: Story = {
    render: () => <TranslateAtFieldPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getAllByRole("button", { name: "Translate" })[1]);
        await waitFor(() => expect(canvas.getByText("Alt text translated into German and French · created unpublished")).toBeVisible());
    },
};
