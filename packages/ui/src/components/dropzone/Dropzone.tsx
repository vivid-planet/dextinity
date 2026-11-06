import { Progress } from "@base-ui/react/progress";
import { clsx } from "clsx";
import { type ChangeEvent, type DragEvent, forwardRef, type HTMLAttributes, type ReactNode, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Dropzone.module.scss";

export interface DropzoneUpload {
    /** A stable id. */
    id: string;
    /** The file name. */
    name: string;
    /** How far the upload is, from 0 to 1, or `null` while unknown. */
    progress: number | null;
    /**
     * `done` shows a check, `error` the `error` message in place of the progress.
     *
     * @defaultValue `"uploading"`
     */
    status?: "uploading" | "done" | "error";
    /** Why the upload failed, shown with `status: "error"`. */
    error?: ReactNode;
}

export interface DropzoneRejection {
    /** The file that was left out. */
    file: File;
    /** `type` when the file doesn't match `accept`, `size` when it exceeds `maxSize`. */
    reason: "type" | "size";
}

export interface DropzoneLabels {
    /** The call to action. */
    title: string;
    /** Joins the call to action and the button for choosing files. */
    or: string;
    /** The button for choosing files. */
    browse: string;
    /** The text shown while files are dragged over the overlay. */
    drop: string;
}

const defaultLabels: DropzoneLabels = {
    title: "Drag files here",
    or: "or",
    browse: "choose files",
    drop: "Drop files to upload",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DropzoneOwnerState = {
    overlay: boolean;
    disabled: boolean;
    error: boolean;
};

export interface DropzoneSlotProps {
    /** Props for the `zone` slot, the dashed drop area. */
    zone?: SlotPropsValue<DropzoneOwnerState, "div">;
    /** Props for the `input` slot, the hidden file input. */
    input?: SlotPropsValue<DropzoneOwnerState, "input">;
    /** Props for the `error` slot. */
    error?: SlotPropsValue<DropzoneOwnerState, "p">;
    /** Props for the `uploads` slot, the list of uploads. */
    uploads?: SlotPropsValue<DropzoneOwnerState, "ul">;
}

export interface DropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "onDrop"> {
    /** Called with the accepted files, dropped or chosen. */
    onFiles: (files: File[]) => void;
    /** Called with the files left out because of `accept` or `maxSize`. Show the reason through `error`. */
    onReject?: (rejections: DropzoneRejection[]) => void;
    /** The accepted file types, as in the file input's `accept` attribute, e.g. `image/*,application/pdf`. */
    accept?: string;
    /** The maximum file size in bytes. */
    maxSize?: number;
    /**
     * Allows several files at once. Without it, only the first file is taken.
     *
     * @defaultValue `true`
     */
    multiple?: boolean;
    /**
     * Prevents dropping and choosing files.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Lies over `children`, e.g. a file list, and appears only while files are dragged over them. Keep a separate upload button
     * for choosing files.
     *
     * @defaultValue `false`
     */
    overlay?: boolean;
    /** The content the overlay lies over. Only used with `overlay`. */
    children?: ReactNode;
    /** What can be uploaded, e.g. "Images, PDF, video up to 200 MB". */
    hint?: ReactNode;
    /** A message about rejected files or a failed upload. */
    error?: ReactNode;
    /** The uploads in progress or just finished, listed below the drop area. */
    uploads?: ReadonlyArray<DropzoneUpload>;
    /** The built-in texts. */
    labels?: Partial<DropzoneLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DropzoneSlotProps;
}

function matchesAccept(file: File, accept: string | undefined) {
    if (accept == null || accept.trim() === "") {
        return true;
    }
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept
        .split(",")
        .map((token) => token.trim().toLowerCase())
        .filter((token) => token !== "")
        .some((token) =>
            token.startsWith(".") ? name.endsWith(token) : token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : type === token,
        );
}

function hasFiles(event: DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * The place to upload files by dragging them in or choosing them. As an overlay, it lies over a file list and appears while files
 * are dragged over it.
 */
export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(function Dropzone(
    {
        onFiles,
        onReject,
        accept,
        maxSize,
        multiple = true,
        disabled = false,
        overlay = false,
        children,
        hint,
        error,
        uploads = [],
        labels: labelsProp,
        className,
        slotProps,
        onDragEnter,
        onDragOver,
        onDragLeave,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: DropzoneOwnerState = { overlay, disabled, error: error != null };
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepth = useRef(0);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (fileList: FileList | null) => {
        const files = Array.from(fileList ?? []).slice(0, multiple ? undefined : 1);
        const accepted: File[] = [];
        const rejections: DropzoneRejection[] = [];
        for (const file of files) {
            if (!matchesAccept(file, accept)) {
                rejections.push({ file, reason: "type" });
            } else if (maxSize != null && file.size > maxSize) {
                rejections.push({ file, reason: "size" });
            } else {
                accepted.push(file);
            }
        }
        if (accepted.length > 0) {
            onFiles(accepted);
        }
        if (rejections.length > 0) {
            onReject?.(rejections);
        }
    };

    const zoneProps = resolveSlotProps<DropzoneOwnerState, "div", "div">({
        ownProps: {
            className: styles.zone,
            onClick: overlay || disabled ? undefined : () => inputRef.current?.click(),
        },
        slotProps: slotProps?.zone,
        ownerState,
    });
    const inputProps = resolveSlotProps<DropzoneOwnerState, "input", "input">({
        ownProps: {
            className: styles.input,
            type: "file",
            accept,
            multiple,
            disabled,
            tabIndex: -1,
            "aria-hidden": true,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                handleFiles(event.target.files);
                event.target.value = "";
            },
        },
        slotProps: slotProps?.input,
        ownerState,
    });
    const errorProps = resolveSlotProps<DropzoneOwnerState, "p", "p">({
        ownProps: { className: styles.error, role: "alert" },
        slotProps: slotProps?.error,
        ownerState,
    });
    const uploadsProps = resolveSlotProps<DropzoneOwnerState, "ul", "ul">({
        ownProps: { className: styles.uploads },
        slotProps: slotProps?.uploads,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-overlay={ownerState.overlay ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-error={ownerState.error ? "" : undefined}
            data-dragging={dragging ? "" : undefined}
            className={clsx(styles.root, className)}
            onDragEnter={(event) => {
                onDragEnter?.(event);
                if (disabled || !hasFiles(event)) {
                    return;
                }
                event.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
            }}
            onDragOver={(event) => {
                onDragOver?.(event);
                if (disabled || !hasFiles(event)) {
                    return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(event) => {
                onDragLeave?.(event);
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) {
                    setDragging(false);
                }
            }}
            onDrop={(event) => {
                dragDepth.current = 0;
                setDragging(false);
                if (disabled || !hasFiles(event)) {
                    return;
                }
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
            }}
        >
            {overlay && children}
            <div {...zoneProps}>
                <Icon name="upload" className={styles.icon} />
                {overlay ? (
                    <span className={styles.title}>{labels.drop}</span>
                ) : (
                    <>
                        <span className={styles.title}>{labels.title}</span>
                        <span className={styles.hint}>
                            {labels.or}{" "}
                            <button type="button" className={styles.browse} disabled={disabled}>
                                {labels.browse}
                            </button>
                            {hint != null && (
                                <>
                                    <span aria-hidden="true">{" · "}</span>
                                    {hint}
                                </>
                            )}
                        </span>
                    </>
                )}
            </div>
            <input {...inputProps} ref={inputRef} />
            {error != null && <p {...errorProps}>{error}</p>}
            {uploads.length > 0 && (
                <ul {...uploadsProps}>
                    {uploads.map((upload) => {
                        const status = upload.status ?? "uploading";
                        return (
                            <li key={upload.id} className={styles.upload} data-status={status}>
                                <Icon name={status === "done" ? "check" : status === "error" ? "error" : "file"} className={styles.uploadIcon} />
                                <span className={styles.uploadName}>{upload.name}</span>
                                {status === "error" ? (
                                    <span className={styles.uploadError}>{upload.error}</span>
                                ) : (
                                    <Progress.Root
                                        value={status === "done" ? 1 : upload.progress}
                                        min={0}
                                        max={1}
                                        aria-label={upload.name}
                                        className={styles.progress}
                                    >
                                        <Progress.Track className={styles.track}>
                                            <Progress.Indicator className={styles.indicator} />
                                        </Progress.Track>
                                    </Progress.Root>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
});
