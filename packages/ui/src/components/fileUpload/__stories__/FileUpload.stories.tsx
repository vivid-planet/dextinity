import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { interiorImage, landscapeImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fileUploadTokens from "../_tokens.scss?raw";
import { FileUpload, type FileUploadContext, type FileUploadFile, type FileUploadProps } from "../FileUpload";
import styles from "./FileUpload.stories.module.scss";

/** Simulates an upload: progress in five steps; a file whose name contains "fail" fails on the first attempt. */
const failedOnce = new Set<string>();
function simulateUpload(file: File, { onProgress, signal }: FileUploadContext): Promise<FileUploadFile> {
    return new Promise((resolve, reject) => {
        let progress = 0;
        const timer = setInterval(() => {
            progress += 0.2;
            onProgress(Math.min(progress, 1));
            if (file.name.includes("fail") && !failedOnce.has(file.name) && progress >= 0.6) {
                clearInterval(timer);
                failedOnce.add(file.name);
                reject(new Error("Connection lost"));
            } else if (progress >= 1) {
                clearInterval(timer);
                resolve({ id: `${file.name}-${Date.now()}`, name: file.name, size: file.size, url: "#" });
            }
        }, 250);
        signal.addEventListener("abort", () => clearInterval(timer));
    });
}

function ControlledFileUpload(props: FileUploadProps) {
    const [value, setValue] = useState(props.value);
    return (
        <FileUpload
            {...props}
            value={value}
            onChange={(next) => {
                setValue(next);
                props.onChange(next);
            }}
        />
    );
}

function createFile(name: string, type: string, size = 120_000) {
    const file = new File(["x"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
}

function fileInput(canvasElement: HTMLElement) {
    const input = canvasElement.querySelector<HTMLInputElement>("input[type=file]");
    if (input == null) {
        throw new Error("missing file input");
    }
    return input;
}

const meta = {
    component: FileUpload,
    title: "Building blocks/Media & upload/FileUpload",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.container}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: fileUploadTokens },
    args: {
        label: "Attachment",
        value: [],
        onChange: fn(),
        onUpload: simulateUpload,
        onUploadingChange: fn(),
        hint: "PDF or image up to 5 MB",
        accept: "application/pdf,image/*",
        maxSize: 5_000_000,
    },
    argTypes: {
        multiple: { control: "boolean" },
        required: { control: "boolean" },
        disabled: { control: "boolean" },
        readOnly: { control: "boolean" },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        value: { control: false },
        onUpload: { control: false },
        getErrorMessage: { control: false },
        formatSize: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledFileUpload {...args} />,
} satisfies Meta<typeof FileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * One file: the drop area makes way for it until it is removed.
 *
 * **Rules**
 * - Say what can be uploaded in `hint`.
 * - Let a failed upload be tried again instead of making the user choose the file again.
 */
export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        canvas.getByRole("button", { name: "choose files" }).focus();
        await userEvent.upload(fileInput(canvasElement), createFile("contract.pdf", "application/pdf"));
        await expect(await canvas.findByRole("progressbar", { name: "contract.pdf" })).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Cancel upload" })).toHaveFocus();
        await waitFor(() => expect(canvas.getByRole("link", { name: "contract.pdf" })).toBeVisible(), { timeout: 3000 });
        await expect(canvas.getByRole("button", { name: "Remove" })).toHaveFocus();
        await expect(args.onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "contract.pdf", size: 120_000 })]);
        await expect(args.onUploadingChange).toHaveBeenLastCalledWith(false);
        await expect(canvas.queryByRole("button", { name: "choose files" })).toBeNull();

        await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
        await expect(args.onChange).toHaveBeenLastCalledWith([]);
        await expect(canvas.getByRole("button", { name: "choose files" })).toHaveFocus();
    },
};

/**
 * Several files upload side by side; each one is added once it is done.
 */
export const Multiple: Story = {
    args: { multiple: true, label: "Documents" },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.upload(fileInput(canvasElement), [createFile("offer.pdf", "application/pdf"), createFile("terms.pdf", "application/pdf")]);
        await waitFor(() => expect(canvas.getAllByRole("link")).toHaveLength(2), { timeout: 3000 });
        await expect(args.onChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ name: "offer.pdf" }),
            expect.objectContaining({ name: "terms.pdf" }),
        ]);
    },
};

/**
 * Files that don't match `accept` or exceed `maxSize` are listed with the reason; a failed upload can be tried again.
 */
export const Errors: Story = {
    args: { multiple: true, label: "Documents" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.upload(fileInput(canvasElement), createFile("huge.pdf", "application/pdf", 9_000_000), { applyAccept: false });
        await expect(await canvas.findByRole("alert")).toHaveTextContent("This file is too large.");

        await userEvent.upload(fileInput(canvasElement), createFile("upload-fail.pdf", "application/pdf"));
        await expect(await canvas.findByText("The upload failed.", {}, { timeout: 3000 })).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
        await waitFor(() => expect(canvas.getByRole("link", { name: "upload-fail.pdf" })).toBeVisible(), { timeout: 3000 });

        await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
        await expect(canvas.queryByText("This file is too large.")).toBeNull();
    },
};

/**
 * Uploaded files with previews, at most three.
 */
export const MaxFiles: Story = {
    args: {
        multiple: true,
        maxFiles: 3,
        label: "Gallery images",
        hint: "Up to 3 images",
        accept: "image/*",
        value: [
            { id: "1", name: "team-offsite.jpg", size: 2_400_000, url: "#", thumbnailUrl: landscapeImage },
            { id: "2", name: "office-vienna.jpg", size: 1_850_000, url: "#", thumbnailUrl: interiorImage },
        ],
    },
};

/**
 * A required upload shows the form's message below the files.
 */
export const ValidationError: Story = {
    args: { required: true, state: "error", validationMessage: "Attach the signed contract." },
};

/**
 * Shows the files without the drop area and remove buttons.
 */
export const ReadOnly: Story = {
    args: { readOnly: true, value: [{ id: "1", name: "contract-signed.pdf", size: 312_000, url: "#" }] },
};

/**
 * Prevents uploading and removing files.
 */
export const Disabled: Story = {
    args: { disabled: true },
};
