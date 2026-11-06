import type { FileUploadContext, FileUploadFile } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { reactHookFormDecorator } from "../../../storybook/ReactHookFormStoryFrame";
import { FileUploadField } from "../FileUploadField";

function simulateUpload(file: File, { onProgress, signal }: FileUploadContext): Promise<FileUploadFile> {
    return new Promise((resolve) => {
        let progress = 0;
        const timer = setInterval(() => {
            progress += 0.25;
            onProgress(progress);
            if (progress >= 1) {
                clearInterval(timer);
                resolve({ id: file.name, name: file.name, size: file.size });
            }
        }, 150);
        signal.addEventListener("abort", () => clearInterval(timer));
    });
}

function fileInput(canvasElement: HTMLElement) {
    const input = canvasElement.querySelector<HTMLInputElement>("input[type=file]");
    if (input == null) {
        throw new Error("missing file input");
    }
    return input;
}

const meta = {
    title: "Forms/React Hook Form/FileUploadField",
    component: FileUploadField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { attachments: [{ id: "terms.pdf", name: "terms.pdf", size: 84_000 }] } },
    args: { name: "attachments", label: "Attachments", multiple: true, onUpload: simulateUpload, hint: "PDF up to 5 MB", accept: "application/pdf" },
} satisfies Meta<typeof FileUploadField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.upload(fileInput(canvasElement), new File(["%PDF"], "offer.pdf", { type: "application/pdf" }));
        await waitFor(() => expect(canvas.getByText(/Values: .*"offer\.pdf"/)).toBeInTheDocument(), { timeout: 3000 });
        await userEvent.click(canvas.getAllByRole("button", { name: "Remove" })[0]);
        await expect(canvas.getByText(/Values: .*/)).not.toHaveTextContent("terms.pdf");
    },
};

/**
 * A required upload needs at least one file; submitting without one shows the message and focuses the button for choosing files.
 */
export const Required: Story = {
    args: { name: "contract", label: "Signed contract", multiple: false, required: true, requiredMessage: "Attach the signed contract" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Attach the signed contract")).toBeVisible();
        await waitFor(() => expect(canvas.getByRole("button", { name: "choose files" })).toHaveFocus());
    },
};
