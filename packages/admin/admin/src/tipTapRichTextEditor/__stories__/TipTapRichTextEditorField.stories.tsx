import { TextField as MuiTextField } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSONContent } from "@tiptap/react";
import { Form } from "react-final-form";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Alert } from "../../alert/Alert";
import { Button } from "../../common/buttons/Button";
import type { TipTapRichTextEditorLink, TipTapRichTextEditorOptions } from "../options";
import { TipTapRichTextEditorField } from "../TipTapRichTextEditorField";

type Story = StoryObj<typeof TipTapRichTextEditorField>;

const config: Meta<typeof TipTapRichTextEditorField> = {
    component: TipTapRichTextEditorField,
    title: "components/form/TipTapRichTextEditorField",
};
export default config;

interface FormValues {
    description?: JSONContent;
}

const urlLink: TipTapRichTextEditorLink<{ url: string }> = {
    createInitialData: () => ({ url: "" }),
    Form: ({ data, onChange }) => <MuiTextField label="URL" value={data.url} onChange={(event) => onChange({ url: event.target.value })} fullWidth />,
};

const options: TipTapRichTextEditorOptions = {
    textBlocks: [
        { name: "paragraph", tag: "p", label: "Paragraph" },
        { name: "heading-2", tag: "h2", label: "Heading 2" },
        { name: "heading-3", tag: "h3", label: "Heading 3" },
    ],
    link: urlLink,
    minHeight: 120,
};

function TipTapRichTextEditorForm({ required }: { required?: boolean }) {
    return (
        <Form<FormValues>
            onSubmit={() => {
                // not handled
            }}
            subscription={{ values: true, valid: true }}
            render={({ handleSubmit, values, valid }) => (
                <form onSubmit={handleSubmit}>
                    <TipTapRichTextEditorField name="description" label="Description" options={options} required={required} fullWidth />
                    <Button type="submit">Submit</Button>
                    <Alert title="FormState">
                        <pre data-testid="form-state">{JSON.stringify({ valid, values }, null, 2)}</pre>
                    </Alert>
                </form>
            )}
        />
    );
}

/**
 * The field stores TipTap JSON. Links store the data of the link form, here a URL.
 */
export const Default: Story = {
    tags: ["test"],
    render: () => <TipTapRichTextEditorForm />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const editor = canvasElement.querySelector<HTMLElement>(".tiptap");
        if (!editor) {
            throw new Error("The editor is missing");
        }

        await userEvent.click(editor);
        await userEvent.keyboard("Hello");

        await waitFor(() => expect(canvas.getByTestId("form-state")).toHaveTextContent('"text": "Hello"'));
    },
};

/**
 * An editor emptied by the user still holds a document, which the field treats as missing when it is required.
 */
export const Required: Story = {
    tags: ["test"],
    render: () => <TipTapRichTextEditorForm required />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const editor = canvasElement.querySelector<HTMLElement>(".tiptap");
        if (!editor) {
            throw new Error("The editor is missing");
        }

        await userEvent.click(editor);
        await userEvent.keyboard("A");
        await waitFor(() => expect(canvas.getByTestId("form-state")).toHaveTextContent('"valid": true'));

        await userEvent.keyboard("{Backspace}");
        await waitFor(() => expect(canvas.getByTestId("form-state")).toHaveTextContent('"valid": false'));
    },
};
