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
import styles from "./TranslateAndAi.stories.module.scss";

const localeNames: Record<string, string> = { de: "German", fr: "French" };

function suggest(text: string) {
    return () => new Promise<string>((resolve) => setTimeout(() => resolve(text), 600));
}

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
                    actions={
                        <FieldActions
                            translate
                            aiAssist
                            targetLocales={["de", "fr"]}
                            onTranslate={translate("Meta title")}
                            onAiSuggest={suggest("Jobs at Example Ltd – open positions in Vienna and Graz")}
                            onAiAccept={setMetaTitle}
                        />
                    }
                >
                    <Input name="metaTitle" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
                </Field>
                <Field
                    label="Alt text"
                    helperText="Per language."
                    actions={
                        <FieldActions
                            translate
                            aiAssist
                            targetLocales={["de", "fr"]}
                            onTranslate={translate("Alt text")}
                            onAiSuggest={suggest("Three colleagues discuss a design draft at a bright office table.")}
                            onAiAccept={setAltText}
                        />
                    }
                >
                    <Textarea name="altText" rows={2} value={altText} onChange={(event) => setAltText(event.target.value)} />
                </Field>
            </div>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

function TranslateAndAiPage() {
    return (
        <PatternPage>
            <PatternSection title="Example" description="Hover or focus a field: Translate and AI at the label.">
                <FieldsExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Trigger", description: "At the label, only for fields where it makes sense (text per language, alt text, SEO)." },
                    { title: "Suggestion", description: "Appears at the field, marked, with Accept and Discard." },
                    { title: "Accept", description: "Becomes normal content; AI images keep their label." },
                    { title: "Translate", description: "Into other scopes: creates the content unpublished." },
                ]}
            />
            <PatternUses pages={["Form fields", "Status, tags & badges"]} />
            <PatternRules
                dos={["A person accepts, never automatically.", "Translations are created unpublished."]}
                donts={["AI buttons at every field.", "Suggestions that can't be discarded."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Translate & AI at the field",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component: "Help right at the field; the person decides. `FieldActions` in a field's `actions` adds Translate and AI to the label.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: let a person accept, never apply automatically; create translations unpublished.
 * - Don't: put AI buttons at every field; show suggestions that can't be discarded.
 */
export const Default: Story = {
    render: () => <TranslateAndAiPage />,
};

/**
 * The AI suggestion appears at the field; accepting it makes it the field's content.
 */
export const AcceptSuggestion: Story = {
    render: () => <TranslateAndAiPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getAllByRole("button", { name: "Improve with AI" })[0]);
        await userEvent.click(await canvas.findByRole("button", { name: "Accept" }));
        await expect(canvas.getByRole("textbox", { name: "Meta title" })).toHaveValue("Jobs at Example Ltd – open positions in Vienna and Graz");
    },
};

/**
 * Translating creates the content unpublished in the other scopes, and the toast says so.
 */
export const Translate: Story = {
    render: () => <TranslateAndAiPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getAllByRole("button", { name: "Translate" })[1]);
        await waitFor(() => expect(canvas.getByText("Alt text translated into German and French · created unpublished")).toBeVisible());
    },
};
