import {
    css,
    FormControl,
    inputBaseClasses,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Select,
    type SelectChangeEvent,
    selectClasses,
} from "@mui/material";
import { grey as muiGreyPalette } from "@mui/material/colors";
import { type Editor, useEditorState } from "@tiptap/react";
import { type MouseEvent, type ReactNode, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import type { TipTapTextAlign } from "./extensions/textBlockAttributes";
import { toggleTextBlockList } from "./extensions/TextBlockList";
import { findListNodeType } from "./findListNodeType";
import { liftOutOfList } from "./liftOutOfList";
import { LinkDialog } from "./LinkDialog";
import type { TipTapResolvedOptions } from "./options";
import {
    findTextBlock,
    getStyledNodes,
    hasTextBlockStyles,
    isTextBlockAllowedInListItem,
    orderedListName,
    type TipTapResolvedList,
    type TipTapResolvedTextBlock,
    unorderedListName,
} from "./textBlocks";
import type { TipTapRichTextEditorClassKey, TipTapRichTextEditorIconMapping } from "./TipTapRichTextEditor";
import { TipTapRichTextEditorToolbarButton } from "./TipTapRichTextEditorToolbarButton";
import { updateTextBlockStyles } from "./updateTextBlockStyles";

const ToolbarButton = ({
    editor,
    icon,
    tooltip,
    ariaLabel,
    isActive,
    disabled,
    onToggle,
}: {
    editor: Editor;
    icon: ReactNode;
    tooltip: ReactNode;
    ariaLabel?: string;
    isActive?: string | boolean;
    disabled?: boolean;
    onToggle: () => void;
}) => (
    <TipTapRichTextEditorToolbarButton
        icon={icon}
        tooltip={tooltip}
        ariaLabel={ariaLabel}
        selected={typeof isActive === "string" ? editor.isActive(isActive) : isActive}
        disabled={disabled}
        onClick={onToggle}
    />
);

const textAlignMessages = defineMessages({
    left: { id: "dextinity.tipTapRichTextEditor.alignLeft.tooltip", defaultMessage: "Align left" },
    center: { id: "dextinity.tipTapRichTextEditor.alignCenter.tooltip", defaultMessage: "Align center" },
    right: { id: "dextinity.tipTapRichTextEditor.alignRight.tooltip", defaultMessage: "Align right" },
    justify: { id: "dextinity.tipTapRichTextEditor.alignJustify.tooltip", defaultMessage: "Justify" },
});

const textAlignIconKeys = {
    left: "alignLeft",
    center: "alignCenter",
    right: "alignRight",
    justify: "alignJustify",
} as const satisfies Record<TipTapTextAlign, keyof TipTapRichTextEditorIconMapping>;

const textAlignOf = (attrs: Record<string, unknown>): TipTapTextAlign => (attrs.textAlign as TipTapTextAlign | null) ?? "left";

function isSelectionAligned(editor: Editor, textAlign: TipTapTextAlign) {
    const { from, to } = editor.state.selection;
    let isAligned = true;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.type.name === "textBlock" && textAlignOf(node.attrs) !== textAlign) {
            isAligned = false;
        }
    });
    return isAligned;
}

export type TipTapRichTextEditorToolbarSlotProps = ThemedComponentBaseProps<{
    toolbar: "div";
    toolbarGroup: "div";
    toolbarSelect: typeof FormControl;
}>["slotProps"];

export const TipTapRichTextEditorToolbar = ({
    editor,
    resolvedOptions,
    canTranslate,
    onTranslateClick,
    icons,
    slotProps,
}: {
    editor: Editor;
    resolvedOptions: TipTapResolvedOptions;
    canTranslate?: boolean;
    onTranslateClick?: () => void;
    icons: Required<TipTapRichTextEditorIconMapping>;
    slotProps?: TipTapRichTextEditorToolbarSlotProps;
}) => {
    const intl = useIntl();
    const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
    const [placeholderAnchorEl, setPlaceholderAnchorEl] = useState<null | HTMLElement>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const hasInlineFormatButtons = resolvedOptions.bold || resolvedOptions.italic || resolvedOptions.underline || resolvedOptions.strike;
    const moreOptions = resolvedOptions.sub || resolvedOptions.sup;
    const lists = resolvedOptions.orderedList || resolvedOptions.unorderedList;
    const specialChars = resolvedOptions.nonBreakingSpace || resolvedOptions.softHyphen;
    const { inlineStyles, placeholders, link, listLevelMax, toolbarItems: ToolbarItems } = resolvedOptions;
    const textBlocks = resolvedOptions.textBlocks;
    const styledNodes = getStyledNodes(resolvedOptions);
    const hasPlaceholders = placeholders.length > 0;

    const editorState = useEditorState({
        editor,
        selector: ({ editor: e }: { editor: Editor }) => {
            const attrs = e.getAttributes("textBlock");
            const activeTextBlock = findTextBlock({ name: attrs.textBlock, textBlocks }) ?? resolvedOptions.defaultTextBlock;
            // A list wins over the text block inside its items, so a list's own styles are offered
            // for a list item's content. Nested lists may mix types, so the innermost one decides -
            // `isActive` would match an outer list of the other type and offer its styles instead.
            const activeStyledNode = (() => {
                const listNodeType = findListNodeType(e.state.selection.$from);
                if (listNodeType === "orderedList") {
                    return orderedListName;
                }
                if (listNodeType === "bulletList") {
                    return unorderedListName;
                }
                return activeTextBlock.name;
            })();
            // Calculate current list nesting depth for listLevelMax enforcement.
            // The list item node only exists in the schema when lists are enabled.
            let canIndent = lists && e.can().sinkListItem("listItem");
            if (canIndent && listLevelMax !== undefined) {
                const { $from } = e.state.selection;
                let listDepth = 0;
                for (let d = 0; d <= $from.depth; d++) {
                    const node = $from.node(d);
                    if (node.type.name === "bulletList" || node.type.name === "orderedList") {
                        listDepth++;
                    }
                }
                if (listDepth >= listLevelMax) {
                    canIndent = false;
                }
            }

            return {
                activeTextBlock: activeTextBlock.name,
                activeStyledNode,
                activeTextBlockStyle: (attrs.textBlockStyle as string) ?? "",
                activeTextAlign: textAlignOf(attrs),
                canUndo: e.can().undo(),
                canRedo: e.can().redo(),
                canIndent,
                canDedent: lists && e.can().liftListItem("listItem"),
                isBoldActive: e.isActive("bold"),
                isItalicActive: e.isActive("italic"),
                isUnderlineActive: e.isActive("underline"),
                isStrikeActive: e.isActive("strike"),
                isSuperscriptActive: e.isActive("superscript"),
                isSubscriptActive: e.isActive("subscript"),
                isOrderedListActive: e.isActive("orderedList"),
                isBulletListActive: e.isActive("bulletList"),
                isLinkActive: e.isActive("link"),
                selectionEmpty: e.state.selection.empty,
                activeInlineStyles: Object.fromEntries(inlineStyles.map((style) => [style.name, e.isActive("inlineStyle", { type: style.name })])),
            };
        },
    });

    const handleMoreClose = () => {
        setMoreAnchorEl(null);
        setTimeout(() => editor.commands.focus(), 0);
    };

    // Menu items run their action via onMouseDown (before the browser's default focus change collapses the
    // editor selection) and via onClick guarded to keyboard activation (MouseEvent.detail is 0 there, unlike
    // for a real pointer click), so both mouse and keyboard users can toggle a menu item.
    const runMenuItemAction = (action: () => void) => {
        handleMoreClose();
        setTimeout(action, 0);
    };
    const handleMenuItemKeyboardActivate = (e: MouseEvent, action: () => void) => {
        if (e.detail === 0) {
            runMenuItemAction(action);
        }
    };

    const handlePlaceholderClose = () => {
        setPlaceholderAnchorEl(null);
        setTimeout(() => editor.commands.focus(), 0);
    };

    const activeStyledNode = styledNodes.find((styledNode) => styledNode.name === editorState.activeStyledNode);
    const applicableTextBlockStyles = activeStyledNode?.styles ?? [];
    // A configured default style means every text block of that type has one, so the styling select
    // drops its "Default" entry and the choice becomes mandatory.
    const activeDefaultStyle = activeStyledNode?.defaultStyle ?? null;
    const applicableInlineStyles = inlineStyles.filter((style) => !style.appliesTo || style.appliesTo.includes(editorState.activeStyledNode));
    // Without bold/italic/underline/strike buttons to fold behind it, a "..." menu just for superscript/subscript/inline
    // styles adds an extra click for no space savings, so show them as individual buttons instead
    const showMoreOptionsAsButtons = !hasInlineFormatButtons && inlineStyles.every((style) => style.icon);

    const moreOptionsItems: {
        key: string;
        icon?: ReactNode;
        label: ReactNode;
        isActive: boolean;
        onToggle: () => void;
    }[] = [
        ...(resolvedOptions.sup
            ? [
                  {
                      key: "superscript",
                      icon: icons.superscript,
                      label: <FormattedMessage id="dextinity.tipTapRichTextEditor.superscript.label" defaultMessage="Superscript" />,
                      isActive: editorState.isSuperscriptActive,
                      onToggle: () => editor.chain().focus().toggleSuperscript().run(),
                  },
              ]
            : []),
        ...(resolvedOptions.sub
            ? [
                  {
                      key: "subscript",
                      icon: icons.subscript,
                      label: <FormattedMessage id="dextinity.tipTapRichTextEditor.subscript.label" defaultMessage="Subscript" />,
                      isActive: editorState.isSubscriptActive,
                      onToggle: () => editor.chain().focus().toggleSubscript().run(),
                  },
              ]
            : []),
        ...applicableInlineStyles.map((style) => ({
            key: style.name,
            icon: style.icon && <style.icon />,
            label: style.label,
            isActive: editorState.activeInlineStyles[style.name],
            onToggle: () => {
                if (editorState.activeInlineStyles[style.name]) {
                    editor.chain().focus().unsetInlineStyle().run();
                } else {
                    editor.chain().focus().setInlineStyle({ type: style.name }).run();
                }
            },
        })),
    ];

    const handleTextBlockChange = (e: SelectChangeEvent) => {
        const textBlock = textBlocks.find((candidate: TipTapResolvedTextBlock) => candidate.name === e.target.value);
        if (!textBlock) {
            return;
        }

        // A list item holds paragraphs, so switching to a heading takes the content out of the list -
        // the result the schema produced by itself while a heading was a node type of its own.
        if (!isTextBlockAllowedInListItem(textBlock)) {
            liftOutOfList(editor);
        }

        // Switching the type only renames the node's text block - the tag follows from the configuration.
        editor.chain().focus().updateAttributes("textBlock", { textBlock: textBlock.name }).run();

        // A list wins over the text block inside its items, so a switch that stays inside a list
        // keeps the list's style instead of falling back to the new text block's. Read after the
        // lift above, which leaves no list for a text block that can't be a list item's content.
        updateTextBlockStyles(editor, (_, pos) => {
            const listNodeType = findListNodeType(editor.state.doc.resolve(pos));
            const activeList =
                listNodeType === "orderedList" ? resolvedOptions.orderedList : listNodeType === "bulletList" ? resolvedOptions.unorderedList : false;
            return activeList || textBlock;
        });
    };

    const handleListToggle = (list: TipTapResolvedList) => {
        toggleTextBlockList(editor, {
            list,
            textBlocks,
            orderedList: resolvedOptions.orderedList,
            unorderedList: resolvedOptions.unorderedList,
        });
    };

    const handleTextBlockStyleChange = (e: SelectChangeEvent) => {
        editor
            .chain()
            .focus()
            .updateAttributes("textBlock", { textBlockStyle: e.target.value || null })
            .run();
    };

    return (
        <Toolbar {...slotProps?.toolbar}>
            {resolvedOptions.undoRedoButtons && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarButton
                        editor={editor}
                        icon={icons.undo}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.undo.tooltip" defaultMessage="Undo" />}
                        disabled={!editorState.canUndo}
                        onToggle={() => editor.chain().focus().undo().run()}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={icons.redo}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.redo.tooltip" defaultMessage="Redo" />}
                        disabled={!editorState.canRedo}
                        onToggle={() => editor.chain().focus().redo().run()}
                    />
                </ToolbarGroup>
            )}
            {textBlocks.length > 1 && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarSelect {...slotProps?.toolbarSelect}>
                        <Select
                            value={editorState.activeTextBlock}
                            onChange={handleTextBlockChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                        >
                            {textBlocks.map((textBlock) => (
                                <MenuItem key={textBlock.name} value={textBlock.name} dense>
                                    {textBlock.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </ToolbarSelect>
                </ToolbarGroup>
            )}
            {hasTextBlockStyles(styledNodes) && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarSelect {...slotProps?.toolbarSelect}>
                        <Select
                            value={editorState.activeTextBlockStyle}
                            disabled={applicableTextBlockStyles.length === 0}
                            onChange={handleTextBlockStyleChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                        >
                            {activeDefaultStyle === null && (
                                <MenuItem value="" dense>
                                    <FormattedMessage id="dextinity.tipTapRichTextEditor.textBlockStyle.default" defaultMessage="Default" />
                                </MenuItem>
                            )}
                            {applicableTextBlockStyles.map((style) => (
                                <MenuItem key={style.name} value={style.name} dense>
                                    {style.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </ToolbarSelect>
                </ToolbarGroup>
            )}
            {canTranslate && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarButton
                        editor={editor}
                        icon={icons.translate}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.translate.tooltip" defaultMessage="Translate" />}
                        onToggle={() => onTranslateClick?.()}
                    />
                </ToolbarGroup>
            )}
            {(hasInlineFormatButtons || moreOptions || applicableInlineStyles.length > 0) && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    {resolvedOptions.bold && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.bold}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.bold.tooltip" defaultMessage="Bold" />}
                            isActive="bold"
                            onToggle={() => editor.chain().focus().toggleBold().run()}
                        />
                    )}
                    {resolvedOptions.italic && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.italic}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.italic.tooltip" defaultMessage="Italic" />}
                            isActive="italic"
                            onToggle={() => editor.chain().focus().toggleItalic().run()}
                        />
                    )}
                    {resolvedOptions.underline && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.underline}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.underline.tooltip" defaultMessage="Underline" />}
                            isActive="underline"
                            onToggle={() => editor.chain().focus().toggleUnderline().run()}
                        />
                    )}
                    {resolvedOptions.strike && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.strike}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.strike.tooltip" defaultMessage="Strikethrough" />}
                            isActive="strike"
                            onToggle={() => editor.chain().focus().toggleStrike().run()}
                        />
                    )}
                    {(moreOptions || applicableInlineStyles.length > 0) &&
                        (showMoreOptionsAsButtons ? (
                            <>
                                {moreOptionsItems.map((item) => (
                                    <ToolbarButton
                                        key={item.key}
                                        editor={editor}
                                        icon={item.icon}
                                        tooltip={item.label}
                                        isActive={item.isActive}
                                        onToggle={item.onToggle}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                <TipTapRichTextEditorToolbarButton
                                    icon={icons.moreOptions}
                                    tooltip={
                                        <FormattedMessage id="dextinity.tipTapRichTextEditor.moreOptions.tooltip" defaultMessage="More options" />
                                    }
                                    ariaLabel={intl.formatMessage({
                                        id: "dextinity.tipTapRichTextEditor.moreOptions.tooltip",
                                        defaultMessage: "More options",
                                    })}
                                    onClick={(e) => setMoreAnchorEl(e.currentTarget)}
                                />
                                <Menu open={Boolean(moreAnchorEl)} anchorEl={moreAnchorEl} onClose={handleMoreClose}>
                                    {moreOptionsItems.map((item) => {
                                        return (
                                            <MenuItem
                                                key={item.key}
                                                selected={item.isActive}
                                                onMouseDown={() => runMenuItemAction(item.onToggle)}
                                                onClick={(e) => handleMenuItemKeyboardActivate(e, item.onToggle)}
                                            >
                                                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                                                <ListItemText>{item.label}</ListItemText>
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </>
                        ))}
                </ToolbarGroup>
            )}
            {resolvedOptions.textAlign.length > 0 && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    {resolvedOptions.textAlign.map((textAlign) => (
                        <ToolbarButton
                            key={textAlign}
                            editor={editor}
                            icon={icons[textAlignIconKeys[textAlign]]}
                            tooltip={<FormattedMessage {...textAlignMessages[textAlign]} />}
                            ariaLabel={intl.formatMessage(textAlignMessages[textAlign])}
                            isActive={editorState.activeTextAlign === textAlign}
                            onToggle={() => {
                                if (!isSelectionAligned(editor, textAlign)) {
                                    editor.chain().focus().updateAttributes("textBlock", { textAlign }).run();
                                }
                            }}
                        />
                    ))}
                </ToolbarGroup>
            )}
            {lists && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    {resolvedOptions.orderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.orderedList}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.orderedList.tooltip" defaultMessage="Ordered list" />}
                            isActive="orderedList"
                            onToggle={() => handleListToggle(resolvedOptions.orderedList as TipTapResolvedList)}
                        />
                    )}
                    {resolvedOptions.unorderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.unorderedList}
                            tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.bulletList.tooltip" defaultMessage="Bullet list" />}
                            isActive="bulletList"
                            onToggle={() => handleListToggle(resolvedOptions.unorderedList as TipTapResolvedList)}
                        />
                    )}
                    <ToolbarButton
                        editor={editor}
                        icon={icons.indent}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.indent.tooltip" defaultMessage="Increase indent" />}
                        disabled={!editorState.canIndent}
                        onToggle={() => editor.chain().focus().sinkListItem("listItem").run()}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={icons.dedent}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.dedent.tooltip" defaultMessage="Decrease indent" />}
                        disabled={!editorState.canDedent}
                        onToggle={() => editor.chain().focus().liftListItem("listItem").run()}
                    />
                </ToolbarGroup>
            )}
            {link && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarButton
                        editor={editor}
                        icon={icons.link}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.link.tooltip" defaultMessage="Link" />}
                        isActive="link"
                        disabled={editorState.selectionEmpty && !editorState.isLinkActive}
                        onToggle={() => setLinkDialogOpen(true)}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={icons.removeLink}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.removeLink.tooltip" defaultMessage="Remove link" />}
                        disabled={!editorState.isLinkActive}
                        onToggle={() => editor.chain().focus().extendMarkRange("link").unsetLinkData().run()}
                    />
                </ToolbarGroup>
            )}
            {hasPlaceholders && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <TipTapRichTextEditorToolbarButton
                        icon={icons.placeholder}
                        tooltip={<FormattedMessage id="dextinity.tipTapRichTextEditor.placeholder.tooltip" defaultMessage="Insert placeholder" />}
                        ariaLabel={intl.formatMessage({
                            id: "dextinity.tipTapRichTextEditor.placeholder.tooltip",
                            defaultMessage: "Insert placeholder",
                        })}
                        onClick={(e) => setPlaceholderAnchorEl(e.currentTarget)}
                    />
                    <Menu open={Boolean(placeholderAnchorEl)} anchorEl={placeholderAnchorEl} onClose={handlePlaceholderClose}>
                        {placeholders.map((placeholder) => (
                            <MenuItem
                                key={placeholder.name}
                                onMouseDown={(e) => {
                                    handlePlaceholderClose();
                                    e.persist();
                                    setTimeout(() => editor.chain().focus().insertPlaceholder(placeholder.name).run(), 0);
                                }}
                            >
                                {placeholder.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </ToolbarGroup>
            )}
            {specialChars && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    {resolvedOptions.nonBreakingSpace && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.nonBreakingSpace}
                            tooltip={
                                <FormattedMessage
                                    id="dextinity.tipTapRichTextEditor.nonBreakingSpace.tooltip"
                                    defaultMessage="Insert a non-breaking space"
                                />
                            }
                            onToggle={() => editor.chain().focus().insertNonBreakingSpace().run()}
                        />
                    )}
                    {resolvedOptions.softHyphen && (
                        <ToolbarButton
                            editor={editor}
                            icon={icons.softHyphen}
                            tooltip={
                                <FormattedMessage id="dextinity.tipTapRichTextEditor.softHyphen.tooltip" defaultMessage="Insert a soft hyphen" />
                            }
                            onToggle={() => editor.chain().focus().insertSoftHyphen().run()}
                        />
                    )}
                </ToolbarGroup>
            )}
            {ToolbarItems && (
                <ToolbarGroup {...slotProps?.toolbarGroup}>
                    <ToolbarItems editor={editor} />
                </ToolbarGroup>
            )}
            {linkDialogOpen && link && <LinkDialog editor={editor} link={link} onClose={() => setLinkDialogOpen(false)} />}
        </Toolbar>
    );
};

const Toolbar = createComponentSlot("div")<TipTapRichTextEditorClassKey>({
    componentName: "TipTapRichTextEditor",
    slotName: "toolbar",
})(
    ({ theme }) => css`
        display: flex;
        flex-wrap: wrap;
        position: sticky;
        top: 0;
        z-index: 2;
        border-top: 1px solid ${theme.palette.grey[100]};
        background-color: ${muiGreyPalette[100]};
        padding: 0 6px;
    `,
);

const ToolbarGroup = createComponentSlot("div")<TipTapRichTextEditorClassKey>({
    componentName: "TipTapRichTextEditor",
    slotName: "toolbarGroup",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        flex-shrink: 0;
        flex-grow: 0;
        height: 34px;
        box-sizing: border-box;
        padding: 5px 6px 5px 0;
        margin-right: 5px;
        border-right: 1px solid ${theme.palette.grey[100]};

        &:last-child {
            margin-right: 0;
            padding-right: 0;
            border-right: none;
        }
    `,
);

const ToolbarSelect = createComponentSlot(FormControl)<TipTapRichTextEditorClassKey>({
    componentName: "TipTapRichTextEditor",
    slotName: "toolbarSelect",
})(css`
    .${inputBaseClasses.root} {
        background-color: transparent;
        height: auto;
        border: none;

        &,
        &:hover {
            &:before,
            &:after {
                border-bottom-width: 0;
            }
        }
    }

    .${selectClasses.icon} {
        top: auto;
        color: inherit;
    }

    .${selectClasses.select}.${inputBaseClasses.input} {
        min-height: 0;
        color: ${muiGreyPalette[600]};
        min-width: 180px;
        line-height: 24px;
        font-size: 14px;
        padding: 0;
    }
`);
