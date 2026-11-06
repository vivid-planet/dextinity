import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import dropzoneTokens from "../_tokens.scss?raw";
import { Dropzone, type DropzoneProps, type DropzoneRejection, type DropzoneUpload } from "../Dropzone";
import styles from "./Dropzone.stories.module.scss";

function describeRejections(rejections: DropzoneRejection[]) {
    return rejections
        .map(({ file, reason }) => (reason === "size" ? `${file.name} is larger than 200 MB.` : `${file.name} is not an image, PDF, or video.`))
        .join(" ");
}

/** Simulates uploads: each accepted file appears in the list and fills up until it is done. */
function UploadingDropzone(props: DropzoneProps) {
    const [uploads, setUploads] = useState<DropzoneUpload[]>(props.uploads ? [...props.uploads] : []);
    const [error, setError] = useState(props.error);

    const uploading = uploads.some((upload) => upload.status === "uploading");
    useEffect(() => {
        if (!uploading) {
            return;
        }
        const timer = setInterval(() => {
            setUploads((current) =>
                current.map((upload) => {
                    if (upload.status !== "uploading") {
                        return upload;
                    }
                    const progress = Math.min(1, (upload.progress ?? 0) + 0.2);
                    return { ...upload, progress, status: progress >= 1 ? "done" : "uploading" };
                }),
            );
        }, 400);
        return () => clearInterval(timer);
    }, [uploading]);

    return (
        <div className={styles.container}>
            <Dropzone
                {...props}
                uploads={uploads}
                error={error}
                onFiles={(files) => {
                    props.onFiles(files);
                    setError(undefined);
                    setUploads((current) => [
                        ...current,
                        ...files.map((file, index) => ({ id: `${Date.now()}-${index}`, name: file.name, progress: 0, status: "uploading" as const })),
                    ]);
                }}
                onReject={(rejections) => {
                    props.onReject?.(rejections);
                    setError(describeRejections(rejections));
                }}
            />
        </div>
    );
}

const meta = {
    component: Dropzone,
    title: "Building blocks/Media & upload/Dropzone",
    decorators: [themeDecorator],
    parameters: { tokens: dropzoneTokens },
    args: {
        onFiles: fn(),
        onReject: fn(),
        hint: "Images, PDF, video up to 200 MB",
    },
    argTypes: {
        multiple: { control: "boolean" },
        disabled: { control: "boolean" },
        overlay: { control: "boolean" },
        uploads: { control: false },
        children: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <UploadingDropzone {...args} />,
} satisfies Meta<typeof Dropzone>;

export default meta;

type Story = StoryObj<typeof meta>;

function dispatchDrag(target: Element, type: "dragenter" | "dragleave" | "drop", ...files: File[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
}

function createFile(name: string, type: string, size = 1024) {
    const file = new File(["x"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
}

/**
 * **Rules**
 *
 * - Dragging must always work; never offer uploading only through a dialog.
 * - Say what can be uploaded in `hint`.
 */
export const Default: Story = {
    play: async ({ args, canvas, canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>("input[type=file]");
        if (input == null) {
            throw new Error("missing file input");
        }
        await userEvent.upload(input, createFile("team.jpg", "image/jpeg"));
        await waitFor(() => expect(args.onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "team.jpg" })]));
        await expect(await canvas.findByRole("progressbar", { name: "team.jpg" })).toBeVisible();
    },
};

/**
 * Files outside `accept` or above `maxSize` go to `onReject`; show why through `error`.
 */
export const AcceptAndMaxSize: Story = {
    args: { accept: "image/*,application/pdf,video/*", maxSize: 200 * 1024 * 1024 },
    play: async ({ args, canvas, canvasElement }) => {
        const zone = canvasElement.querySelector(".dextinityDropzone__zone");
        if (zone == null) {
            throw new Error("missing zone");
        }
        const files = [createFile("photo.png", "image/png"), createFile("notes.txt", "text/plain")];
        dispatchDrag(zone, "dragenter", ...files);
        await waitFor(() => expect(canvasElement.querySelector(".dextinityDropzone")).toHaveAttribute("data-dragging"));
        dispatchDrag(zone, "drop", ...files);
        await waitFor(() => expect(args.onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "photo.png" })]));
        await waitFor(() => expect(args.onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "type" })]));
        await expect(await canvas.findByRole("alert")).toHaveTextContent("notes.txt is not an image, PDF, or video.");
    },
};

/**
 * Uploads list below the drop area with their progress; `null` progress is indeterminate.
 */
export const Uploads: Story = {
    args: {
        uploads: [
            { id: "1", name: "team-offsite.jpg", progress: 0.4, status: "uploading" },
            { id: "2", name: "brochure.pdf", progress: null, status: "uploading" },
            { id: "3", name: "logo.svg", progress: 1, status: "done" },
            { id: "4", name: "keynote.mov", progress: 0.2, status: "error", error: "Larger than 200 MB" },
        ],
    },
    render: (args) => (
        <div className={styles.container}>
            <Dropzone {...args} />
        </div>
    ),
};

export const ErrorMessage: Story = {
    args: { error: "brochure.indd is not an image, PDF, or video." },
    render: (args) => (
        <div className={styles.container}>
            <Dropzone {...args} />
        </div>
    ),
};

export const SingleFile: Story = {
    args: { multiple: false, hint: "One image, up to 10 MB" },
};

export const Disabled: Story = {
    args: { disabled: true },
};

/**
 * Over a file list, the drop area appears only while files are dragged over the list. Keep an "Upload" button for choosing files.
 */
export const Overlay: Story = {
    args: {
        overlay: true,
        children: (
            <ul className={styles.list}>
                {["team-offsite.jpg", "brochure.pdf", "logo.svg", "campaign.mp4"].map((name) => (
                    <li key={name} className={styles.listItem}>
                        {name}
                    </li>
                ))}
            </ul>
        ),
    },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".dextinityDropzone");
        if (root == null) {
            throw new Error("missing root");
        }
        dispatchDrag(root, "dragenter", createFile("photo.png", "image/png"));
        await waitFor(() => expect(root).toHaveAttribute("data-dragging"));
        dispatchDrag(root, "dragleave");
        await waitFor(() => expect(root).not.toHaveAttribute("data-dragging"));
    },
};
