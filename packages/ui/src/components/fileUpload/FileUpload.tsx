import { clsx } from "clsx";
import { type FocusEvent, forwardRef, type HTMLAttributes, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Dropzone, type DropzoneProps, type DropzoneRejection } from "../dropzone/Dropzone";
import type { FieldState } from "../field/Field";
import { useGroupMessage } from "../field/groupMessage";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { ProgressBar } from "../progressBar/ProgressBar";
import { formatFileSize } from "./fileSize";
import styles from "./FileUpload.module.scss";

/** An uploaded file, as `onUpload` returns it. */
export interface FileUploadFile {
    /** Identifies the file, e.g. its id on the server. */
    id: string;
    /** The file name. */
    name: string;
    /** The size in bytes, shown next to the name. */
    size?: number;
    /** Where the file can be opened. Makes the name a link. */
    url?: string;
    /** A small preview image, shown instead of the file icon. */
    thumbnailUrl?: string;
}

/** What `onUpload` receives besides the file. */
export interface FileUploadContext {
    /** Reports how far the upload is, from 0 to 1, or `null` while unknown. */
    onProgress: (progress: number | null) => void;
    /** Aborted when the user cancels the upload or the component unmounts. */
    signal: AbortSignal;
}

/**
 * Texts of the file upload, for translation.
 */
export interface FileUploadLabels {
    /** The button that removes an uploaded file. */
    remove: string;
    /** The button that cancels an upload in progress. */
    cancel: string;
    /** The button that tries a failed upload again. */
    retry: string;
    /** The button that hides a failed or rejected file. */
    dismiss: string;
    /** Why a file was left out because it doesn't match `accept`. */
    rejectedType: string;
    /** Why a file was left out because it exceeds `maxSize`. */
    rejectedSize: string;
    /** Why a file was left out because `maxFiles` was reached. */
    rejectedCount: string;
    /** Why an upload failed, unless `getErrorMessage` says more. */
    uploadFailed: string;
}

const defaultLabels: FileUploadLabels = {
    remove: "Remove",
    cancel: "Cancel upload",
    retry: "Try again",
    dismiss: "Dismiss",
    rejectedType: "This file type isn't allowed.",
    rejectedSize: "This file is too large.",
    rejectedCount: "No more files can be added.",
    uploadFailed: "The upload failed.",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FileUploadOwnerState = {
    state: FieldState;
    multiple: boolean;
    required: boolean;
    disabled: boolean;
    readOnly: boolean;
    uploading: boolean;
};

export interface FileUploadSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FileUploadOwnerState, "span">;
    /** Props for the `files` slot, the list of uploaded, uploading, and failed files. */
    files?: SlotPropsValue<FileUploadOwnerState, "ul">;
    /** Props for the `message` slot, the help or validation message below the files. */
    message?: SlotPropsValue<FileUploadOwnerState, "div">;
    /** Props for the drop area, e.g. its `labels`. */
    dropzone?: Partial<Omit<DropzoneProps, "onFiles" | "onReject" | "accept" | "maxSize" | "multiple" | "disabled" | "overlay" | "uploads">>;
}

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | "defaultValue"> {
    /** The uploaded files. */
    value: ReadonlyArray<FileUploadFile>;
    /** Called with the files after one was uploaded or removed. */
    onChange: (value: FileUploadFile[]) => void;
    /** Uploads a file and resolves with what to add to `value`. Reject it to show the upload as failed. */
    onUpload: (file: File, context: FileUploadContext) => Promise<FileUploadFile>;
    /** Called when the first upload starts and when the last one ends, e.g. to prevent saving the form meanwhile. */
    onUploadingChange?: (uploading: boolean) => void;
    /** Visible label above the drop area. */
    label?: ReactNode;
    /** The accessible name when there is no visible label. Required without `label`. */
    "aria-label"?: string;
    /** Identifies the field when a form is submitted: the ids of the uploaded files. */
    name?: string;
    /** The accepted file types, as in the file input's `accept` attribute, e.g. `image/*,application/pdf`. */
    accept?: string;
    /** The maximum file size in bytes. */
    maxSize?: number;
    /**
     * Allows several files. Without it, the drop area makes way for the file until it is removed.
     *
     * @defaultValue `false`
     */
    multiple?: boolean;
    /** The maximum number of files with `multiple`. The drop area hides once it is reached. */
    maxFiles?: number;
    /** What can be uploaded, shown in the drop area, e.g. "PDF up to 10 MB". */
    hint?: ReactNode;
    /**
     * Adds a star after the label.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * Prevents uploading and removing files.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the files without the drop area and the remove buttons.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** Permanent help below the files. */
    helperText?: ReactNode;
    /** Message for the `state`. Replaces the help while the state is `success`, `warning`, or `error`. Say what is missing and how to fix it. */
    validationMessage?: ReactNode;
    /**
     * Validation state, shown by the message color and the drop area's line.
     *
     * @defaultValue `"default"`
     */
    state?: FieldState;
    /** The message shown for a failed upload, from what `onUpload` rejected with. Defaults to `labels.uploadFailed`. */
    getErrorMessage?: (error: unknown) => ReactNode;
    /** Formats a file size. Defaults to the largest fitting unit in the browser's locale, e.g. `1.4 MB`. */
    formatSize?: (bytes: number) => string;
    /** The built-in texts. */
    labels?: Partial<FileUploadLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FileUploadSlotProps;
}

interface PendingFile {
    key: string;
    file: File;
    progress: number | null;
    status: "uploading" | "failed" | "rejected";
    error?: ReactNode;
    controller?: AbortController;
}

function rejectionMessage(reason: DropzoneRejection["reason"] | "count", labels: FileUploadLabels) {
    return reason === "type" ? labels.rejectedType : reason === "size" ? labels.rejectedSize : labels.rejectedCount;
}

/**
 * Uploads files by dragging them in or choosing them, and lists them with their progress. The value is the list of uploaded files, as
 * `onUpload` describes them; failed uploads can be retried.
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
    {
        value,
        onChange,
        onUpload,
        onUploadingChange,
        label,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        name,
        accept,
        maxSize,
        multiple = false,
        maxFiles,
        hint,
        required = false,
        disabled = false,
        readOnly = false,
        helperText,
        validationMessage,
        state = "default",
        getErrorMessage,
        formatSize = formatFileSize,
        labels: labelsProp,
        className,
        slotProps,
        onFocus,
        onBlur,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [pending, setPending] = useState<PendingFile[]>([]);
    const uploading = pending.some((entry) => entry.status === "uploading");
    const ownerState: FileUploadOwnerState = { state, multiple, required, disabled, readOnly, uploading };
    const message = useGroupMessage({ state, validationMessage, helperText, ariaDescribedBy });

    // Uploads can finish before the parent passes the new value, so each one adds to the latest value it knows of
    const latestValue = useRef(value);
    useLayoutEffect(() => {
        latestValue.current = value;
    }, [value]);
    const nextKey = useRef(0);
    const controllers = useRef(new Set<AbortController>());

    useEffect(() => {
        const activeControllers = controllers.current;
        return () => activeControllers.forEach((controller) => controller.abort());
    }, []);

    const onUploadingChangeRef = useRef(onUploadingChange);
    useLayoutEffect(() => {
        onUploadingChangeRef.current = onUploadingChange;
    }, [onUploadingChange]);
    const reportedUploading = useRef(false);
    useEffect(() => {
        if (reportedUploading.current !== uploading) {
            reportedUploading.current = uploading;
            onUploadingChangeRef.current?.(uploading);
        }
    }, [uploading]);

    // A button that had the focus can disappear: the drop area once the files fill the field, the row of a finished, cancelled, or removed
    // upload. The focus then moves to the nearest remaining control instead of getting lost on the page.
    const rootElement = useRef<HTMLDivElement | null>(null);
    const focusedElement = useRef<HTMLElement | null>(null);
    useLayoutEffect(() => {
        const focused = focusedElement.current;
        const root = rootElement.current;
        if (focused == null || root == null || focused.isConnected) {
            return;
        }
        focusedElement.current = null;
        if (document.activeElement == null || document.activeElement === document.body) {
            root.querySelector<HTMLElement>(`.${styles.files} button, .${styles.dropzone} button:not(:disabled)`)?.focus();
        }
    });

    const updatePending = (key: string, update: Partial<PendingFile> | null) => {
        setPending((current) =>
            update == null
                ? current.filter((entry) => entry.key !== key)
                : current.map((entry) => (entry.key === key ? { ...entry, ...update } : entry)),
        );
    };

    const upload = (file: File, key: string) => {
        const controller = new AbortController();
        controllers.current.add(controller);
        onUpload(file, {
            signal: controller.signal,
            onProgress: (progress) => {
                if (!controller.signal.aborted) {
                    updatePending(key, { progress });
                }
            },
        }).then(
            (uploaded) => {
                controllers.current.delete(controller);
                if (controller.signal.aborted) {
                    return;
                }
                updatePending(key, null);
                const next = multiple ? [...latestValue.current, uploaded] : [uploaded];
                latestValue.current = next;
                onChange(next);
            },
            (error: unknown) => {
                controllers.current.delete(controller);
                if (controller.signal.aborted) {
                    return;
                }
                updatePending(key, {
                    status: "failed",
                    progress: null,
                    controller: undefined,
                    error: getErrorMessage?.(error) ?? labels.uploadFailed,
                });
            },
        );
        return controller;
    };

    const createKey = () => {
        nextKey.current += 1;
        return `upload-${nextKey.current}`;
    };

    const handleFiles = (files: File[]) => {
        const activeCount = value.length + pending.filter((entry) => entry.status === "uploading").length;
        const slots = multiple ? (maxFiles == null ? files.length : Math.max(0, maxFiles - activeCount)) : 1;
        const accepted = files.slice(0, slots);
        const entries: PendingFile[] = [
            ...accepted.map((file) => {
                const key = createKey();
                return { key, file, progress: 0, status: "uploading" as const, controller: upload(file, key) };
            }),
            ...files
                .slice(slots)
                .map((file) => ({ key: createKey(), file, progress: null, status: "rejected" as const, error: labels.rejectedCount })),
        ];
        setPending((current) => [...(multiple ? current : current.filter((entry) => entry.status === "uploading")), ...entries]);
    };

    const handleReject = (rejections: DropzoneRejection[]) => {
        setPending((current) => [
            ...current,
            ...rejections.map(({ file, reason }) => ({
                key: createKey(),
                file,
                progress: null,
                status: "rejected" as const,
                error: rejectionMessage(reason, labels),
            })),
        ]);
    };

    const cancel = (entry: PendingFile) => {
        entry.controller?.abort();
        if (entry.controller != null) {
            controllers.current.delete(entry.controller);
        }
        updatePending(entry.key, null);
    };

    const retry = (entry: PendingFile) => {
        updatePending(entry.key, { status: "uploading", progress: 0, error: undefined, controller: upload(entry.file, entry.key) });
    };

    const remove = (file: FileUploadFile) => {
        const next = latestValue.current.filter((current) => current.id !== file.id);
        latestValue.current = next;
        onChange(next);
    };

    const editable = !disabled && !readOnly;
    const activeCount = value.length + pending.filter((entry) => entry.status === "uploading").length;
    const full = multiple ? maxFiles != null && activeCount >= maxFiles : activeCount > 0;
    const showsDropzone = !readOnly && !full;

    const labelProps = resolveSlotProps<FileUploadOwnerState, "span", "span">({
        ownProps: { className: styles.label, id: message.labelId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const filesProps = resolveSlotProps<FileUploadOwnerState, "ul", "ul">({
        ownProps: { className: styles.files },
        slotProps: slotProps?.files,
        ownerState,
    });
    const messageProps = resolveSlotProps<FileUploadOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: message.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    const renderName = (file: { name: string; url?: string }) =>
        file.url != null ? (
            <a className={styles.name} href={file.url} target="_blank" rel="noreferrer">
                {file.name}
            </a>
        ) : (
            <span className={styles.name}>{file.name}</span>
        );

    return (
        <div
            {...restProps}
            ref={ref}
            role="group"
            aria-label={ariaLabel}
            aria-labelledby={label != null ? message.labelId : undefined}
            aria-describedby={message["aria-describedby"]}
            aria-invalid={message["aria-invalid"]}
            data-state={ownerState.state}
            data-multiple={ownerState.multiple ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-uploading={ownerState.uploading ? "" : undefined}
            className={clsx(styles.root, className)}
            onFocus={(event) => {
                rootElement.current = event.currentTarget;
                focusedElement.current = event.target;
                onFocus?.(event);
            }}
            onBlur={(event: FocusEvent<HTMLDivElement>) => {
                if (event.relatedTarget != null && !event.currentTarget.contains(event.relatedTarget)) {
                    focusedElement.current = null;
                }
                onBlur?.(event);
            }}
        >
            {label != null && (
                <div className={styles.labelRow}>
                    <span {...labelProps}>{label}</span>
                    {required && <span className={styles.required} aria-hidden />}
                </div>
            )}
            {showsDropzone && (
                <Dropzone
                    hint={hint}
                    {...slotProps?.dropzone}
                    className={clsx(styles.dropzone, slotProps?.dropzone?.className)}
                    accept={accept}
                    maxSize={maxSize}
                    multiple={multiple}
                    disabled={disabled}
                    onFiles={handleFiles}
                    onReject={handleReject}
                />
            )}
            {(value.length > 0 || pending.length > 0) && (
                <ul {...filesProps}>
                    {value.map((file) => (
                        <li key={file.id} className={styles.file} data-status="done">
                            {file.thumbnailUrl != null ? (
                                <img className={styles.thumbnail} src={file.thumbnailUrl} alt="" />
                            ) : (
                                <Icon name="page" className={styles.fileIcon} />
                            )}
                            <span className={styles.details}>
                                {renderName(file)}
                                {file.size != null && <span className={styles.meta}>{formatSize(file.size)}</span>}
                            </span>
                            {editable && (
                                <IconButton size="small" aria-label={labels.remove} onClick={() => remove(file)}>
                                    <Icon name="close" />
                                </IconButton>
                            )}
                            {name != null && <input type="hidden" name={name} value={file.id} />}
                        </li>
                    ))}
                    {pending.map((entry) => (
                        <li key={entry.key} className={styles.file} data-status={entry.status}>
                            <Icon name={entry.status === "uploading" ? "upload" : "alert"} className={styles.fileIcon} />
                            <span className={styles.details}>
                                {renderName(entry.file)}
                                {entry.status === "uploading" ? (
                                    <ProgressBar
                                        size="small"
                                        className={styles.progress}
                                        value={entry.progress == null ? null : Math.round(entry.progress * 100)}
                                        aria-label={entry.file.name}
                                    />
                                ) : (
                                    <span className={styles.error} role="alert">
                                        {entry.error}
                                    </span>
                                )}
                            </span>
                            <span className={styles.actions}>
                                {entry.status === "failed" && !disabled && (
                                    <IconButton size="small" aria-label={labels.retry} onClick={() => retry(entry)}>
                                        <Icon name="refresh" />
                                    </IconButton>
                                )}
                                <IconButton
                                    size="small"
                                    aria-label={entry.status === "uploading" ? labels.cancel : labels.dismiss}
                                    onClick={() => cancel(entry)}
                                >
                                    <Icon name="close" />
                                </IconButton>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {message.showsMessage && <div {...messageProps}>{message.message}</div>}
        </div>
    );
});
