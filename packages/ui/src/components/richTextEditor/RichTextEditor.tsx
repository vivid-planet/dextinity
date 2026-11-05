import { Toolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import {
    type ClipboardEvent,
    type CSSProperties,
    type DragEvent,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconNames";
import { IconButton } from "../iconButton/IconButton";
import styles from "./RichTextEditor.module.scss";
import { isSafeHref, sanitizeHtml } from "./sanitizeHtml";

export type RichTextEditorFormat = "heading" | "bold" | "italic" | "bulletList" | "orderedList" | "link";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type RichTextEditorOwnerState = FieldOwnerState;

/**
 * Texts of the editor's toolbar, for translation.
 */
export interface RichTextEditorLabels {
    toolbar: string;
    heading: string;
    bold: string;
    italic: string;
    bulletList: string;
    orderedList: string;
    link: string;
    /** Question for the link target when no `onRequestLink` is given. */
    linkUrl: string;
}

const defaultLabels: RichTextEditorLabels = {
    toolbar: "Formatting",
    heading: "Subheading",
    bold: "Bold",
    italic: "Italic",
    bulletList: "Bulleted list",
    orderedList: "Numbered list",
    link: "Link",
    linkUrl: "Link URL",
};

const allFormats: RichTextEditorFormat[] = ["heading", "bold", "italic", "bulletList", "orderedList", "link"];

const formatIcons: Record<RichTextEditorFormat, IconName> = {
    heading: "heading",
    bold: "bold",
    italic: "italic",
    bulletList: "list",
    orderedList: "list-ordered",
    link: "link",
};

const formatShortcuts: Partial<Record<RichTextEditorFormat, string>> = { bold: "⌘B", italic: "⌘I", link: "⌘K" };

const formatGroups: RichTextEditorFormat[][] = [["heading"], ["bold", "italic", "bulletList", "orderedList"], ["link"]];

type ActiveFormats = Record<RichTextEditorFormat, boolean>;

const noActiveFormats: ActiveFormats = { heading: false, bold: false, italic: false, bulletList: false, orderedList: false, link: false };

export interface RichTextEditorProps
    extends
        Omit<FieldBaseProps, "prefix" | "suffix">,
        Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The content as HTML. Always controlled. Only the toolbar's formatting is kept; everything else is reduced to text. */
    value: string;
    /** Called with the new HTML on every change; set `value` from it. Empty content is `""`. */
    onChange: (html: string) => void;
    /**
     * The formatting the toolbar offers, in this set and order of groups.
     *
     * @defaultValue all formats
     */
    toolbar?: RichTextEditorFormat[];
    /**
     * Minimum height in lines.
     *
     * @defaultValue `4`
     */
    minRows?: number;
    /** Shown while the editor is empty. */
    placeholder?: string;
    /**
     * Asks for a link target, e.g. in a dialog with a page picker. Return `null` to cancel. Without it, the browser's prompt asks.
     */
    onRequestLink?: () => string | null | Promise<string | null>;
    /** Texts of the toolbar, for translation. */
    labels?: Partial<RichTextEditorLabels>;
    /** The id of the editable area, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

function closestLink(editor: HTMLElement) {
    const node = editor.ownerDocument.getSelection()?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const link = element?.closest("a");
    return link != null && editor.contains(link) ? link : null;
}

function readActiveFormats(editor: HTMLElement): ActiveFormats {
    const document = editor.ownerDocument;
    return {
        heading: document.queryCommandValue("formatBlock").toLowerCase() === "h3",
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        bulletList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        link: closestLink(editor) != null,
    };
}

function isEmpty(editor: HTMLElement) {
    return (editor.textContent ?? "").trim() === "" && editor.querySelector("li, a") == null;
}

function preventFocusLoss(event: MouseEvent) {
    event.preventDefault();
}

/**
 * Formatted text for body copy: subheadings, bold, italic, lists, and links. A minimal editor without dependencies, built on the
 * browser's editing commands; it covers the formatting of short CMS texts, not documents with tables, images, or nested lists.
 */
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading,
        size,
        actions,
        name,
        value,
        onChange,
        toolbar = allFormats,
        minRows = 4,
        placeholder,
        onRequestLink,
        labels: labelsProp,
        id,
        className,
        slotProps,
        style,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const editorRef = useRef<HTMLDivElement | null>(null);
    const emittedValue = useRef<string | null>(null);
    const [activeFormats, setActiveFormats] = useState<ActiveFormats>(noActiveFormats);
    const editable = !disabled && !readOnly;

    useLayoutEffect(() => {
        const editor = editorRef.current;
        if (editor != null && value !== emittedValue.current) {
            editor.innerHTML = sanitizeHtml(value);
            emittedValue.current = value;
        }
    }, [value]);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor == null) {
            return;
        }
        const document = editor.ownerDocument;
        const update = () => {
            const anchor = document.getSelection()?.anchorNode;
            if (anchor != null && editor.contains(anchor)) {
                setActiveFormats(readActiveFormats(editor));
            }
        };
        document.addEventListener("selectionchange", update);
        return () => document.removeEventListener("selectionchange", update);
    }, []);

    const emit = useCallback(() => {
        const editor = editorRef.current;
        if (editor == null) {
            return;
        }
        const html = isEmpty(editor) ? "" : sanitizeHtml(editor.innerHTML);
        emittedValue.current = html;
        setActiveFormats(readActiveFormats(editor));
        onChange(html);
    }, [onChange]);

    const runCommand = (command: string, argument?: string) => {
        const editor = editorRef.current;
        if (editor == null) {
            return;
        }
        editor.focus();
        editor.ownerDocument.execCommand("defaultParagraphSeparator", false, "p");
        editor.ownerDocument.execCommand(command, false, argument);
        emit();
    };

    const toggleLink = async () => {
        const editor = editorRef.current;
        if (editor == null) {
            return;
        }
        const document = editor.ownerDocument;
        const selection = document.getSelection();
        const existingLink = closestLink(editor);
        if (existingLink != null) {
            const range = document.createRange();
            range.selectNodeContents(existingLink);
            selection?.removeAllRanges();
            selection?.addRange(range);
            runCommand("unlink");
            return;
        }

        const savedRange = selection != null && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
        const href = onRequestLink != null ? await onRequestLink() : window.prompt(labels.linkUrl, "https://");
        if (href == null || !isSafeHref(href)) {
            return;
        }
        editor.focus();
        if (savedRange != null) {
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
        }
        if (savedRange == null || savedRange.collapsed) {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = href;
            runCommand("insertHTML", link.outerHTML);
        } else {
            runCommand("createLink", href);
        }
    };

    const applyFormat = (format: RichTextEditorFormat) => {
        switch (format) {
            case "heading":
                runCommand("formatBlock", activeFormats.heading ? "<p>" : "<h3>");
                break;
            case "bold":
                runCommand("bold");
                break;
            case "italic":
                runCommand("italic");
                break;
            case "bulletList":
                runCommand("insertUnorderedList");
                break;
            case "orderedList":
                runCommand("insertOrderedList");
                break;
            case "link":
                void toggleLink();
                break;
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!(event.metaKey || event.ctrlKey)) {
            return;
        }
        const key = event.key.toLowerCase();
        const format: RichTextEditorFormat | undefined = key === "b" ? "bold" : key === "i" ? "italic" : key === "k" ? "link" : undefined;
        if (format == null) {
            return;
        }
        event.preventDefault();
        if (toolbar.includes(format)) {
            applyFormat(format);
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        runCommand("insertText", event.clipboardData.getData("text/plain"));
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const editor = editorRef.current;
        const text = event.dataTransfer.getData("text/plain");
        if (editor == null || !editable || text === "") {
            return;
        }
        const document = editor.ownerDocument;
        const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
        editor.focus();
        if (range != null && editor.contains(range.startContainer)) {
            const selection = document.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
        runCommand("insertText", text);
    };

    const groups = formatGroups.map((group) => group.filter((format) => toolbar.includes(format))).filter((group) => group.length > 0);

    return (
        <Field
            {...restProps}
            ref={ref}
            style={{ ...style, "--dextinity-rich-text-editor-min-rows": minRows } as CSSProperties}
            className={clsx(styles.root, className)}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            actions={actions}
            slotProps={slotProps}
        >
            {(control) => (
                <>
                    {groups.length > 0 && (
                        <Toolbar.Root className={styles.toolbar} aria-label={labels.toolbar} disabled={!editable}>
                            {groups.map((group, groupIndex) => [
                                groupIndex > 0 && <Toolbar.Separator key={`separator-${group[0]}`} className={styles.separator} />,
                                ...group.map((format) => (
                                    <Toolbar.Button
                                        key={format}
                                        render={
                                            <IconButton
                                                aria-label={labels[format]}
                                                shortcut={formatShortcuts[format]}
                                                aria-pressed={activeFormats[format]}
                                                className={styles.toolbarButton}
                                                onMouseDown={preventFocusLoss}
                                                onClick={() => applyFormat(format)}
                                            >
                                                <Icon name={formatIcons[format]} />
                                            </IconButton>
                                        }
                                    />
                                )),
                            ])}
                        </Toolbar.Root>
                    )}
                    <div
                        ref={editorRef}
                        id={control.id}
                        className={styles.content}
                        role="textbox"
                        aria-multiline
                        aria-labelledby={control["aria-labelledby"]}
                        aria-describedby={control["aria-describedby"]}
                        aria-invalid={control["aria-invalid"]}
                        aria-required={control["aria-required"]}
                        aria-busy={control["aria-busy"]}
                        aria-readonly={readOnly || undefined}
                        aria-disabled={disabled || undefined}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        tabIndex={disabled ? -1 : 0}
                        data-empty={value === "" ? "" : undefined}
                        data-placeholder={placeholder}
                        onInput={emit}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                    />
                    <input type="hidden" name={name} value={value} />
                </>
            )}
        </Field>
    );
});
