import type { Extensions } from "@tiptap/core";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { clsx } from "clsx";
import { type CSSProperties, forwardRef, Fragment, type HTMLAttributes, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Field, type FieldBaseProps, type FieldControlProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import { MenuCheckboxItem } from "../menu/MenuCheckboxItem";
import { MenuItem } from "../menu/MenuItem";
import { MenuRadioGroup } from "../menu/MenuRadioGroup";
import { MenuRadioItem } from "../menu/MenuRadioItem";
import { Toolbar } from "../toolbar/Toolbar";
import { ToolbarButton } from "../toolbar/ToolbarButton";
import { ToolbarGroup } from "../toolbar/ToolbarGroup";
import { ToolbarMenu } from "../toolbar/ToolbarMenu";
import { ToolbarSeparator } from "../toolbar/ToolbarSeparator";
import {
    createLinkShortcut,
    createListLevelMax,
    createMaxBlocks,
    InlineStyle,
    listDepthAt,
    NonBreakingSpace,
    type RichTextEditorTextAlign,
    SoftHyphen,
    TextAlign,
    TextPlaceholder,
} from "./extensions";
import { isSafeHref } from "./isSafeHref";
import styles from "./RichTextEditor.module.scss";

export type { RichTextEditorTextAlign } from "./extensions";

export type RichTextEditorFormat =
    | "undoRedo"
    | "blockType"
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "subscript"
    | "superscript"
    | "textAlign"
    | "bulletList"
    | "orderedList"
    | "link"
    | "nonBreakingSpace"
    | "softHyphen";

export type RichTextEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A token the editor inserts as a whole, e.g. a recipient's name in a newsletter. Stored as
 * `<span data-type="placeholder" data-name="…">{{…}}</span>`.
 */
export interface RichTextEditorTextPlaceholder {
    /** Stored in the value, e.g. `firstName`. */
    name: string;
    /** Shown in the insert menu, e.g. "First name". */
    label: string;
}

/**
 * Formatting of the project's own, e.g. a highlighted product name. Stored as `<span data-inline-style="…">`; style it with
 * `.dextinityRichTextEditor__content [data-inline-style="…"]` and the same attribute where the text is rendered.
 */
export interface RichTextEditorInlineStyle {
    /** Stored in the value, e.g. `productName`. */
    name: string;
    /** Shown in the toolbar, e.g. "Product name". */
    label: string;
    /** Needed to show the style as a toolbar button, which happens when there are no bold, italic, underline, or strikethrough buttons. */
    icon?: IconName;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type RichTextEditorOwnerState = FieldOwnerState;

/**
 * Texts of the editor's toolbar, for translation.
 */
export interface RichTextEditorLabels {
    toolbar: string;
    undo: string;
    redo: string;
    /** The accessible name of the text style menu. */
    blockType: string;
    paragraph: string;
    headingLevel: (level: RichTextEditorHeadingLevel) => string;
    bold: string;
    italic: string;
    underline: string;
    strike: string;
    subscript: string;
    superscript: string;
    /** The menu next to the bold and italic buttons that holds subscript, superscript, and the inline styles. */
    moreFormatting: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    alignJustify: string;
    bulletList: string;
    orderedList: string;
    indent: string;
    outdent: string;
    link: string;
    removeLink: string;
    /** Question for the link target when no `onRequestLink` is given. */
    linkUrl: string;
    insertPlaceholder: string;
    nonBreakingSpace: string;
    softHyphen: string;
}

const defaultLabels: RichTextEditorLabels = {
    toolbar: "Formatting",
    undo: "Undo",
    redo: "Redo",
    blockType: "Text style",
    paragraph: "Paragraph",
    headingLevel: (level) => `Heading ${level}`,
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strikethrough",
    subscript: "Subscript",
    superscript: "Superscript",
    moreFormatting: "More formatting",
    alignLeft: "Align left",
    alignCenter: "Align center",
    alignRight: "Align right",
    alignJustify: "Justify",
    bulletList: "Bulleted list",
    orderedList: "Numbered list",
    indent: "Increase indent",
    outdent: "Decrease indent",
    link: "Link",
    removeLink: "Remove link",
    linkUrl: "Link URL",
    insertPlaceholder: "Insert placeholder",
    nonBreakingSpace: "Insert a non-breaking space",
    softHyphen: "Insert a soft hyphen",
};

const defaultToolbar: RichTextEditorFormat[] = [
    "undoRedo",
    "blockType",
    "bold",
    "italic",
    "strike",
    "subscript",
    "superscript",
    "bulletList",
    "orderedList",
    "link",
    "nonBreakingSpace",
    "softHyphen",
];

const allHeadingLevels: RichTextEditorHeadingLevel[] = [1, 2, 3, 4, 5, 6];

const textAlignments: RichTextEditorTextAlign[] = ["left", "center", "right", "justify"];

const textAlignIcons: Record<RichTextEditorTextAlign, IconName> = {
    left: "rte-align-left",
    center: "rte-align-center",
    right: "rte-align-right",
    justify: "rte-align-justify",
};

const textAlignLabels: Record<RichTextEditorTextAlign, "alignLeft" | "alignCenter" | "alignRight" | "alignJustify"> = {
    left: "alignLeft",
    center: "alignCenter",
    right: "alignRight",
    justify: "alignJustify",
};

type MarkFormat = "bold" | "italic" | "underline" | "strike";

const markFormats: MarkFormat[] = ["bold", "italic", "underline", "strike"];

const markIcons: Record<MarkFormat, IconName> = { bold: "rte-bold", italic: "rte-italic", underline: "rte-underlined", strike: "rte-strikethrough" };

const markShortcuts: Record<MarkFormat, string> = { bold: "⌘B", italic: "⌘I", underline: "⌘U", strike: "⌘⇧S" };

type ScriptFormat = "subscript" | "superscript";

const scriptIcons: Record<ScriptFormat, IconName> = { subscript: "rte-sub", superscript: "rte-sup" };

const scriptShortcuts: Record<ScriptFormat, string> = { subscript: "⌘,", superscript: "⌘." };

export interface RichTextEditorProps
    extends
        Omit<FieldBaseProps, "prefix" | "suffix">,
        Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The content as HTML. Always controlled. Only the enabled formatting is kept; everything else is reduced to text. */
    value: string;
    /** Called with the new HTML on every change; set `value` from it. Empty content is `""`. */
    onChange: (html: string) => void;
    /**
     * The formatting the editor offers. Formatting that isn't listed is removed from pasted and incoming content, and its keyboard
     * shortcut does nothing. Undo and redo work by keyboard even without their buttons.
     *
     * @defaultValue everything except `"underline"` and `"textAlign"`
     */
    toolbar?: RichTextEditorFormat[];
    /**
     * The heading levels the text style menu offers next to the paragraph. Needs `"blockType"` in `toolbar`.
     *
     * @defaultValue `[1, 2, 3, 4, 5, 6]`
     */
    headingLevels?: RichTextEditorHeadingLevel[];
    /** Tokens the toolbar inserts as a whole, e.g. a recipient's name. */
    textPlaceholders?: RichTextEditorTextPlaceholder[];
    /** Formatting of the project's own, offered next to subscript and superscript. */
    inlineStyles?: RichTextEditorInlineStyle[];
    /** The maximum number of top-level paragraphs, headings, and lists. */
    maxBlocks?: number;
    /** The maximum nesting depth of lists: `1` allows only flat lists. */
    listLevelMax?: number;
    /**
     * Minimum height in lines.
     *
     * @defaultValue `4`
     */
    minRows?: number;
    /** Shown while the editor is empty. */
    placeholder?: string;
    /**
     * Asks for a link target, e.g. in a dialog with a page picker. Receives the current target when the cursor is on a link. Return
     * `null` to cancel. Without it, the browser's prompt asks.
     */
    onRequestLink?: (currentHref: string | null) => string | null | Promise<string | null>;
    /** Texts of the toolbar, for translation. */
    labels?: Partial<RichTextEditorLabels>;
    /** The id of the editable area, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

interface EditorConfig {
    formats: RichTextEditorFormat[];
    headingLevels: RichTextEditorHeadingLevel[];
    textPlaceholderNames: string[];
    inlineStyleNames: string[];
    maxBlocks: number | undefined;
    listLevelMax: number | undefined;
    placeholder: string | undefined;
}

function buildExtensions(config: EditorConfig, requestLink: () => void): Extensions {
    const has = (format: RichTextEditorFormat) => config.formats.includes(format);
    const hasHeadings = has("blockType") && config.headingLevels.length > 0;
    const hasLists = has("bulletList") || has("orderedList");
    return [
        StarterKit.configure({
            bold: has("bold") ? {} : false,
            italic: has("italic") ? {} : false,
            underline: has("underline") ? {} : false,
            strike: has("strike") ? {} : false,
            heading: hasHeadings ? { levels: config.headingLevels } : false,
            bulletList: has("bulletList") ? {} : false,
            orderedList: has("orderedList") ? {} : false,
            listItem: hasLists ? {} : false,
            listKeymap: hasLists ? {} : false,
            link: has("link")
                ? {
                      openOnClick: false,
                      autolink: false,
                      HTMLAttributes: { target: null, rel: null, class: null },
                      isAllowedUri: (url) => isSafeHref(url),
                  }
                : false,
            blockquote: false,
            code: false,
            codeBlock: false,
            horizontalRule: false,
            trailingNode: false,
        }),
        ...(has("subscript") ? [Subscript] : []),
        ...(has("superscript") ? [Superscript] : []),
        ...(has("textAlign") ? [TextAlign] : []),
        ...(has("nonBreakingSpace") ? [NonBreakingSpace] : []),
        ...(has("softHyphen") ? [SoftHyphen] : []),
        ...(config.textPlaceholderNames.length > 0 ? [TextPlaceholder] : []),
        ...(config.inlineStyleNames.length > 0 ? [InlineStyle.configure({ names: config.inlineStyleNames })] : []),
        ...(has("link") ? [createLinkShortcut(requestLink)] : []),
        ...(config.maxBlocks !== undefined ? [createMaxBlocks(config.maxBlocks)] : []),
        ...(config.listLevelMax !== undefined ? [createListLevelMax(config.listLevelMax)] : []),
        Placeholder.configure({ placeholder: config.placeholder ?? "", emptyNodeClass: styles.emptyBlock }),
    ];
}

function htmlOf(editor: Editor) {
    return editor.isEmpty ? "" : editor.getHTML();
}

function textAlignAt(editor: Editor): RichTextEditorTextAlign {
    const attributes = editor.isActive("heading") ? editor.getAttributes("heading") : editor.getAttributes("paragraph");
    return (attributes.textAlign as RichTextEditorTextAlign | null) ?? "left";
}

function blockTypeOf(level: RichTextEditorHeadingLevel | null) {
    return level == null ? "paragraph" : `heading${level}`;
}

function headingLevelOf(blockType: string) {
    return blockType === "paragraph" ? null : (Number(blockType.replace("heading", "")) as RichTextEditorHeadingLevel);
}

interface RichTextEditorBodyProps {
    control: FieldControlProps;
    config: EditorConfig;
    value: string;
    onChange: (html: string) => void;
    disabled: boolean;
    readOnly: boolean;
    labels: RichTextEditorLabels;
    textPlaceholders: RichTextEditorTextPlaceholder[];
    inlineStyles: RichTextEditorInlineStyle[];
    onRequestLink: RichTextEditorProps["onRequestLink"];
}

function RichTextEditorBody({
    control,
    config,
    value,
    onChange,
    disabled,
    readOnly,
    labels,
    textPlaceholders,
    inlineStyles,
    onRequestLink,
}: RichTextEditorBodyProps) {
    const { formats, headingLevels, listLevelMax } = config;
    const has = (format: RichTextEditorFormat) => formats.includes(format);
    const editable = !disabled && !readOnly;
    const hasLists = has("bulletList") || has("orderedList");
    const onChangeRef = useRef(onChange);
    const requestLinkRef = useRef<() => void>(() => undefined);
    const emittedValues = useRef<string[]>([value]);
    const [blockTypeMenuOpen, setBlockTypeMenuOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [placeholderMenuOpen, setPlaceholderMenuOpen] = useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const configKey = JSON.stringify(config);
    // The editor's schema is fixed at creation, so the extensions, and with them the editor, are recreated only when the config changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const extensions = useMemo(() => buildExtensions(config, () => requestLinkRef.current()), [configKey]);

    const editor = useEditor(
        {
            extensions,
            content: value,
            editable,
            injectCSS: false,
            onUpdate: ({ editor: updatedEditor }) => {
                const html = htmlOf(updatedEditor);
                emittedValues.current.push(html);
                onChangeRef.current(html);
            },
        },
        [extensions],
    );

    const {
        id: controlId,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        "aria-required": ariaRequired,
        "aria-busy": ariaBusy,
    } = control;
    const attributes = useMemo(() => {
        const entries: Record<string, string | true | undefined> = {
            id: controlId,
            class: styles.content,
            role: "textbox",
            "aria-multiline": "true",
            "aria-labelledby": ariaLabelledBy,
            "aria-describedby": ariaDescribedBy,
            "aria-invalid": ariaInvalid,
            "aria-required": ariaRequired,
            "aria-busy": ariaBusy,
            "aria-readonly": readOnly || undefined,
            "aria-disabled": disabled || undefined,
            tabindex: disabled ? "-1" : "0",
        };
        return Object.fromEntries(Object.entries(entries).flatMap(([key, entry]) => (entry === undefined ? [] : [[key, String(entry)]])));
    }, [controlId, ariaLabelledBy, ariaDescribedBy, ariaInvalid, ariaRequired, ariaBusy, readOnly, disabled]);

    useEffect(() => {
        editor.setOptions({ editorProps: { attributes } });
    }, [editor, attributes]);

    useEffect(() => {
        editor.setEditable(editable, false);
    }, [editor, editable]);

    useEffect(() => {
        // React can render a keystroke's value after later keystrokes reached the editor; applying a value the editor emitted itself would undo them.
        const emittedIndex = emittedValues.current.indexOf(value);
        if (emittedIndex >= 0) {
            emittedValues.current.splice(0, emittedIndex + 1);
            return;
        }
        emittedValues.current.length = 0;
        if (value === htmlOf(editor)) {
            return;
        }
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value, { emitUpdate: false });
        editor.commands.setTextSelection({ from, to });
    }, [editor, value]);

    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => {
            const inList = hasLists && current.isActive("listItem");
            return {
                blockType: blockTypeOf(current.isActive("heading") ? (current.getAttributes("heading").level as RichTextEditorHeadingLevel) : null),
                canUndo: current.can().undo(),
                canRedo: current.can().redo(),
                bold: current.isActive("bold"),
                italic: current.isActive("italic"),
                underline: current.isActive("underline"),
                strike: current.isActive("strike"),
                subscript: current.isActive("subscript"),
                superscript: current.isActive("superscript"),
                inlineStyle: (current.getAttributes("inlineStyle").name as string | undefined) ?? null,
                textAlign: textAlignAt(current),
                bulletList: current.isActive("bulletList"),
                orderedList: current.isActive("orderedList"),
                canIndent:
                    inList && current.can().sinkListItem("listItem") && (listLevelMax === undefined || listDepthAt(current.state) < listLevelMax),
                canOutdent: inList && current.can().liftListItem("listItem"),
                link: current.isActive("link"),
            };
        },
    });

    const requestLink = async () => {
        if (!editor.isEditable) {
            return;
        }
        const currentHref = editor.isActive("link") ? ((editor.getAttributes("link").href as string | undefined) ?? null) : null;
        const href = onRequestLink != null ? await onRequestLink(currentHref) : window.prompt(labels.linkUrl, currentHref ?? "https://");
        if (href == null || !isSafeHref(href)) {
            editor.commands.focus();
            return;
        }
        if (editor.state.selection.empty && currentHref == null) {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
                .run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }
    };

    useEffect(() => {
        requestLinkRef.current = () => void requestLink();
    });

    const setBlockType = (blockType: string) => {
        const level = headingLevelOf(blockType);
        if (level == null) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().clearNodes().setHeading({ level }).run();
        }
    };

    const blockTypeLabel = (blockType: string) => {
        const level = headingLevelOf(blockType);
        return level == null ? labels.paragraph : labels.headingLevel(level);
    };

    const enabledMarks = markFormats.filter(has);
    const scriptFormats = (["subscript", "superscript"] as const).filter(has);
    const hasMoreFormatting = scriptFormats.length > 0 || inlineStyles.length > 0;
    const moreFormattingAsButtons = enabledMarks.length === 0 && inlineStyles.every((style) => style.icon != null);
    const toggleScript = (format: ScriptFormat) =>
        format === "subscript" ? editor.chain().focus().toggleSubscript().run() : editor.chain().focus().toggleSuperscript().run();
    const toggleInlineStyle = (name: string) =>
        state.inlineStyle === name ? editor.chain().focus().unsetInlineStyle().run() : editor.chain().focus().setInlineStyle(name).run();

    const groups: { key: string; content: ReactNode }[] = [];
    if (has("undoRedo")) {
        groups.push({
            key: "history",
            content: (
                <ToolbarGroup>
                    <ToolbarButton
                        aria-label={labels.undo}
                        shortcut="⌘Z"
                        disabled={!state.canUndo}
                        keepFocus
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        <Icon name="rte-undo" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={labels.redo}
                        shortcut="⌘⇧Z"
                        disabled={!state.canRedo}
                        keepFocus
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        <Icon name="rte-redo" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }
    if (has("blockType") && headingLevels.length > 0) {
        groups.push({
            key: "blockType",
            content: (
                <ToolbarMenu
                    label={blockTypeLabel(state.blockType)}
                    aria-label={labels.blockType}
                    open={blockTypeMenuOpen}
                    onOpenChange={setBlockTypeMenuOpen}
                >
                    <MenuRadioGroup value={state.blockType} onChange={setBlockType}>
                        {[null, ...headingLevels].map((level) => (
                            <MenuRadioItem key={blockTypeOf(level)} value={blockTypeOf(level)} label={blockTypeLabel(blockTypeOf(level))} />
                        ))}
                    </MenuRadioGroup>
                </ToolbarMenu>
            ),
        });
    }
    if (enabledMarks.length > 0 || hasMoreFormatting) {
        groups.push({
            key: "marks",
            content: (
                <ToolbarGroup>
                    {enabledMarks.map((format) => (
                        <ToolbarButton
                            key={format}
                            aria-label={labels[format]}
                            shortcut={markShortcuts[format]}
                            pressed={state[format]}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleMark(format).run()}
                        >
                            <Icon name={markIcons[format]} />
                        </ToolbarButton>
                    ))}
                    {moreFormattingAsButtons ? (
                        <>
                            {scriptFormats.map((format) => (
                                <ToolbarButton
                                    key={format}
                                    aria-label={labels[format]}
                                    shortcut={scriptShortcuts[format]}
                                    pressed={state[format]}
                                    keepFocus
                                    onClick={() => toggleScript(format)}
                                >
                                    <Icon name={scriptIcons[format]} />
                                </ToolbarButton>
                            ))}
                            {inlineStyles.map((style) => (
                                <ToolbarButton
                                    key={style.name}
                                    aria-label={style.label}
                                    pressed={state.inlineStyle === style.name}
                                    keepFocus
                                    onClick={() => toggleInlineStyle(style.name)}
                                >
                                    {style.icon != null && <Icon name={style.icon} />}
                                </ToolbarButton>
                            ))}
                        </>
                    ) : (
                        hasMoreFormatting && (
                            <ToolbarMenu
                                icon={<Icon name="more-horizontal" />}
                                aria-label={labels.moreFormatting}
                                open={moreMenuOpen}
                                onOpenChange={setMoreMenuOpen}
                            >
                                {scriptFormats.map((format) => (
                                    <MenuCheckboxItem
                                        key={format}
                                        label={labels[format]}
                                        icon={<Icon name={scriptIcons[format]} />}
                                        checked={state[format]}
                                        onChange={() => toggleScript(format)}
                                    />
                                ))}
                                {inlineStyles.map((style) => (
                                    <MenuCheckboxItem
                                        key={style.name}
                                        label={style.label}
                                        icon={style.icon != null ? <Icon name={style.icon} /> : undefined}
                                        checked={state.inlineStyle === style.name}
                                        onChange={() => toggleInlineStyle(style.name)}
                                    />
                                ))}
                            </ToolbarMenu>
                        )
                    )}
                </ToolbarGroup>
            ),
        });
    }
    if (has("textAlign")) {
        groups.push({
            key: "textAlign",
            content: (
                <ToolbarGroup>
                    {textAlignments.map((textAlign) => (
                        <ToolbarButton
                            key={textAlign}
                            aria-label={labels[textAlignLabels[textAlign]]}
                            pressed={state.textAlign === textAlign}
                            keepFocus
                            onClick={() => editor.chain().focus().setTextAlign(textAlign).run()}
                        >
                            <Icon name={textAlignIcons[textAlign]} />
                        </ToolbarButton>
                    ))}
                </ToolbarGroup>
            ),
        });
    }
    if (hasLists) {
        groups.push({
            key: "lists",
            content: (
                <ToolbarGroup>
                    {has("bulletList") && (
                        <ToolbarButton
                            aria-label={labels.bulletList}
                            shortcut="⌘⇧8"
                            pressed={state.bulletList}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            <Icon name="rte-ul-bullet-point" />
                        </ToolbarButton>
                    )}
                    {has("orderedList") && (
                        <ToolbarButton
                            aria-label={labels.orderedList}
                            shortcut="⌘⇧7"
                            pressed={state.orderedList}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                            <Icon name="rte-ol" />
                        </ToolbarButton>
                    )}
                    <ToolbarButton
                        aria-label={labels.indent}
                        shortcut="Tab"
                        disabled={!state.canIndent}
                        keepFocus
                        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
                    >
                        <Icon name="rte-indent-increase" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={labels.outdent}
                        shortcut="⇧Tab"
                        disabled={!state.canOutdent}
                        keepFocus
                        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
                    >
                        <Icon name="rte-indent-decrease" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }
    if (has("link")) {
        groups.push({
            key: "link",
            content: (
                <ToolbarGroup>
                    <ToolbarButton aria-label={labels.link} shortcut="⌘K" pressed={state.link} keepFocus onClick={() => void requestLink()}>
                        <Icon name="rte-link" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={labels.removeLink}
                        disabled={!state.link}
                        keepFocus
                        onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
                    >
                        <Icon name="rte-clear-link" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }
    if (textPlaceholders.length > 0) {
        groups.push({
            key: "placeholders",
            content: (
                <ToolbarMenu
                    icon={<Icon name="rte-text-placeholder" />}
                    aria-label={labels.insertPlaceholder}
                    open={placeholderMenuOpen}
                    onOpenChange={setPlaceholderMenuOpen}
                >
                    {textPlaceholders.map((textPlaceholder) => (
                        <MenuItem
                            key={textPlaceholder.name}
                            label={textPlaceholder.label}
                            onClick={() => editor.chain().focus().insertTextPlaceholder(textPlaceholder.name).run()}
                        />
                    ))}
                </ToolbarMenu>
            ),
        });
    }
    if (has("nonBreakingSpace") || has("softHyphen")) {
        groups.push({
            key: "specialCharacters",
            content: (
                <ToolbarGroup>
                    {has("nonBreakingSpace") && (
                        <ToolbarButton
                            aria-label={labels.nonBreakingSpace}
                            keepFocus
                            onClick={() => editor.chain().focus().insertNonBreakingSpace().run()}
                        >
                            <Icon name="rte-non-breaking-space" />
                        </ToolbarButton>
                    )}
                    {has("softHyphen") && (
                        <ToolbarButton aria-label={labels.softHyphen} keepFocus onClick={() => editor.chain().focus().insertSoftHyphen().run()}>
                            <Icon name="rte-soft-hyphen" />
                        </ToolbarButton>
                    )}
                </ToolbarGroup>
            ),
        });
    }

    return (
        <>
            {groups.length > 0 && (
                <Toolbar className={styles.toolbar} aria-label={labels.toolbar} disabled={!editable}>
                    {groups.map((group, index) => (
                        <Fragment key={group.key}>
                            {index > 0 && <ToolbarSeparator />}
                            {group.content}
                        </Fragment>
                    ))}
                </Toolbar>
            )}
            <EditorContent editor={editor} className={styles.editor} />
        </>
    );
}

/**
 * Formatted text for body copy, built on Tiptap with the formatting of the CMS's rich text block: text styles, bold, italic,
 * underline, strikethrough, subscript, superscript, alignment, nested lists, links, placeholders, non-breaking spaces, and soft
 * hyphens.
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
        toolbar = defaultToolbar,
        headingLevels = allHeadingLevels,
        textPlaceholders = [],
        inlineStyles = [],
        maxBlocks,
        listLevelMax,
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
    const config: EditorConfig = {
        formats: [...new Set(toolbar)].sort(),
        headingLevels,
        textPlaceholderNames: textPlaceholders.map((textPlaceholder) => textPlaceholder.name),
        inlineStyleNames: inlineStyles.map((inlineStyle) => inlineStyle.name),
        maxBlocks,
        listLevelMax,
        placeholder,
    };

    return (
        <Field
            {...restProps}
            ref={ref}
            style={{ ...style, "--dextinity-rich-text-editor-min-rows": minRows } as CSSProperties}
            className={clsx(styles.root, className)}
            layout="stacked"
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
                    <RichTextEditorBody
                        control={control}
                        config={config}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        readOnly={readOnly}
                        labels={labels}
                        textPlaceholders={textPlaceholders}
                        inlineStyles={inlineStyles}
                        onRequestLink={onRequestLink}
                    />
                    <input type="hidden" name={name} value={value} />
                </>
            )}
        </Field>
    );
});
