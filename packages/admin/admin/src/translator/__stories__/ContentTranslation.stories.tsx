import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

import { FinalForm } from "../../FinalForm";
import { TextAreaField } from "../../form/fields/TextAreaField";
import { TextField } from "../../form/fields/TextField";
import { FinalFormDebug } from "../../form/FinalFormDebug";
import { ContentTranslationServiceProvider } from "../ContentTranslationServiceProvider";

const reverseTranslate = async (text: string): Promise<string> => {
    return text.split("").reverse().join("");
};

interface FormValues {
    title: string;
    description: string;
}

const initialValues: FormValues = {
    title: "Hello World",
    description: "The quick brown fox jumps over the lazy dog.",
};

const TranslationProvider = ({ children, showApplyTranslationDialog }: PropsWithChildren<{ showApplyTranslationDialog?: boolean }>) => (
    <ContentTranslationServiceProvider enabled translate={reverseTranslate} showApplyTranslationDialog={showApplyTranslationDialog}>
        {children}
    </ContentTranslationServiceProvider>
);

type Story = StoryObj<typeof ContentTranslationServiceProvider>;

const config: Meta<typeof ContentTranslationServiceProvider> = {
    component: ContentTranslationServiceProvider,
    title: "components/translator/ContentTranslation",
};

export default config;

/**
 * Translation is applied immediately when clicking the translate button on a `TextField` or `TextAreaField`.
 *
 * The fake `translate` function used here reverses the input text.
 */
export const Default: Story = {
    render: () => (
        <TranslationProvider>
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={initialValues}
                subscription={{ values: true }}
            >
                <TextField name="title" label="Title" fullWidth />
                <TextAreaField name="description" label="Description" fullWidth />
                <FinalFormDebug />
            </FinalForm>
        </TranslationProvider>
    ),
};

/**
 * With `showApplyTranslationDialog` enabled, the translation is shown in a dialog where the user can review
 * and edit it before applying. For `TextAreaField`, the dialog renders the input as a multiline textarea.
 */
export const WithApplyTranslationDialog: Story = {
    render: () => (
        <TranslationProvider showApplyTranslationDialog>
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={initialValues}
                subscription={{ values: true }}
            >
                <TextField name="title" label="Title" fullWidth />
                <TextAreaField name="description" label="Description" fullWidth />
                <FinalFormDebug />
            </FinalForm>
        </TranslationProvider>
    ),
};
