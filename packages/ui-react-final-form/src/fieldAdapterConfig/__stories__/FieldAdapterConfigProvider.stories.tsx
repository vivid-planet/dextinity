import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Mutator } from "final-form";
import { type ReactNode, useEffect } from "react";
import { useField, useForm } from "react-final-form";
import { expect, userEvent, within } from "storybook/test";

import { InputField } from "../../fields/inputField/InputField";
import { SelectField } from "../../fields/selectField/SelectField";
import { TextareaField } from "../../fields/textareaField/TextareaField";
import { finalFormDecorator } from "../../storybook/FinalFormStoryFrame";
import { FieldAdapterConfigProvider } from "../FieldAdapterConfigProvider";

const setWarning: Mutator = ([name, warning]: [string, ReactNode], state) => {
    const field = state.fields[name];
    if (field != null) {
        field.data = { ...field.data, warning };
    }
};

function warnAboutLongTitle(value: string | undefined) {
    return value != null && value.length > 30 ? "Search engines cut titles after about 30 characters here" : undefined;
}

function useSlugChangeWarning() {
    const form = useForm();
    const { meta } = useField("slug", { subscription: { dirty: true } });
    useEffect(() => {
        form.mutators.setWarning("slug", meta.dirty ? "Changing the URL breaks links to the page from elsewhere" : undefined);
    }, [form, meta.dirty]);
}

function TitleAndSlug() {
    useSlugChangeWarning();
    return (
        <>
            <InputField name="title" label="Title" required warn={warnAboutLongTitle} />
            <InputField name="slug" label="URL" prefix="example.com/" />
        </>
    );
}

const meta = {
    title: "Forms/Final Form/FieldAdapterConfigProvider",
    component: FieldAdapterConfigProvider,
    decorators: [finalFormDecorator],
    parameters: {
        initialValues: { title: "Benefits", slug: "benefits" },
        formMutators: { setWarning },
    },
} satisfies Meta<typeof FieldAdapterConfigProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Warnings show as `state="warning"` and never block submitting. A field's `warn` returns one for its value; for anything else, e.g.
 * a rule across fields or a hint from the server, set `meta.data.warning` with a mutator. An error wins over a warning.
 */
export const Warnings: Story = {
    render: () => <TitleAndSlug />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.type(canvas.getByLabelText("Title"), " at Example Inc., the agency for software");
        await userEvent.tab();
        await expect(canvas.getByText("Search engines cut titles after about 30 characters here")).toBeVisible();
        await expect(canvas.getByLabelText("Title")).not.toHaveAttribute("aria-invalid");

        await userEvent.type(canvas.getByLabelText("URL"), "-at-example");
        await userEvent.tab();
        await expect(canvas.getByText("Changing the URL breaks links to the page from elsewhere")).toBeVisible();

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByRole("status")).toHaveTextContent("Submitted:");
    },
};

const layouts = [
    { value: "text", label: "Text only" },
    { value: "image", label: "Image and text" },
];

/**
 * A block form saves on every change, so no submit reveals its errors: wrap it in a provider with `showErrors="always"` (and usually
 * `showWarnings="always"`) to show them as soon as the content is invalid.
 */
export const AutosavingBlockForm: Story = {
    parameters: { initialValues: { headline: "", teaser: "A team that thinks things through and builds products that stay in use." } },
    render: () => (
        <FieldAdapterConfigProvider showErrors="always" showWarnings="always">
            <InputField name="headline" label="Headline" required requiredMessage="Enter a headline" />
            <TextareaField
                name="teaser"
                label="Teaser"
                rows={2}
                warn={(value: string | undefined) =>
                    value != null && value.length > 60 ? "Teasers over 60 characters are cut on mobile" : undefined
                }
            />
            <SelectField name="layout" label="Layout" options={layouts} required requiredMessage="Choose a layout" />
        </FieldAdapterConfigProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText("Enter a headline")).toBeVisible();
        await expect(canvas.getByText("Choose a layout")).toBeVisible();
        await expect(canvas.getByText("Teasers over 60 characters are cut on mobile")).toBeVisible();

        await userEvent.type(canvas.getByLabelText("Headline"), "Benefits");
        await expect(canvas.queryByText("Enter a headline")).not.toBeInTheDocument();
    },
};

/**
 * A nested provider overrides the settings it sets for the adapters inside it and inherits the others.
 */
export const NestedProviders: Story = {
    parameters: { initialValues: { title: "", seoTitle: "" } },
    render: () => (
        <FieldAdapterConfigProvider showErrors="always">
            <InputField name="title" label="Title" required />
            <FieldAdapterConfigProvider showErrors="touched-or-submitted">
                <InputField name="seoTitle" label="SEO title" required helperText="Shows its error once touched" />
            </FieldAdapterConfigProvider>
        </FieldAdapterConfigProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByText("Required")).toHaveLength(1);
    },
};
