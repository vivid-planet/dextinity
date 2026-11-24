import {
    MoreHorizontal,
    RteAlignCenter,
    RteAlignJustify,
    RteAlignLeft,
    RteAlignRight,
    RteBold,
    RteClearLink,
    RteIndentDecrease,
    RteIndentIncrease,
    RteItalic,
    RteLink,
    RteNonBreakingSpace,
    RteOl,
    RteRedo,
    RteSoftHyphen,
    RteStrikethrough,
    RteSub,
    RteSup,
    RteTextPlaceholder,
    RteUl,
    RteUnderlined,
    RteUndo,
    Translate,
} from "@dextinity/admin-icons";
import {
    Box,
    FormControl,
    inputBaseClasses,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Select,
    type SelectChangeEvent,
    selectClasses,
    type SvgIconProps,
} from "@mui/material";
import { grey as muiGreyPalette } from "@mui/material/colors";
import { type Editor, useEditorState } from "@tiptap/react";
import { type ForwardRefExoticComponent, type MouseEvent, type ReactNode, type RefAttributes, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { greyPalette } from "../theme/colors";
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
import { TipTapRichTextEditorToolbarButton } from "./TipTapRichTextEditorToolbarButton";
import { updateTextBlockStyles } from "./updateTextBlockStyles";

const ToolbarButton = ({
    editor,
    icon: Icon,
    tooltip,
    ariaLabel,
    isActive,
    disabled,
    onToggle,
}: {
    editor: Editor;
    icon: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
    tooltip: ReactNode;
    ariaLabel?: string;
    isActive?: string | boolean;
    disabled?: boolean;
    onToggle: () => void;
}) => (
    <TipTapRichTextEditorToolbarButton
        icon={<Icon />}
        tooltip={tooltip}
        ariaLabel={ariaLabel}
        selected={typeof isActive === "string" ? editor.isActive(isActive) : isActive}
        disabled={disabled}
        onClick={onToggle}
    />
);

const toolbarSlotSx = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
    height: 34,
    boxSizing: "border-box",
    py: "5px",
    pr: "6px",
    mr: "5px",
    borderRight: `1px solid ${greyPalette[100]}`,
    "&:last-child": {
        mr: 0,
        pr: 0,
        borderRight: "none",
    },
} as const;

const ToolbarGroup = ({ children }: { children: ReactNode }) => <Box sx={toolbarSlotSx}>{children}</Box>;

const textAlignMessages = defineMessages({
    left: { id: "dextinity.blocks.tipTapRichText.alignLeft.tooltip", defaultMessage: "Align left" },
    center: { id: "dextinity.blocks.tipTapRichText.alignCenter.tooltip", defaultMessage: "Align center" },
    right: { id: "dextinity.blocks.tipTapRichText.alignRight.tooltip", defaultMessage: "Align right" },
    justify: { id: "dextinity.blocks.tipTapRichText.alignJustify.tooltip", defaultMessage: "Justify" },
});

const textAlignIcons: Record<TipTapTextAlign, ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    left: RteAlignLeft,
    center: RteAlignCenter,
    right: RteAlignRight,
    justify: RteAlignJustify,
};

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

const selectFormControlSx = {
    [`& .${inputBaseClasses.root}`]: {
        backgroundColor: "transparent",
        height: "auto",
        border: "none",
        "&, &:hover": { "&:before, &:after": { borderBottomWidth: 0 } },
    },
    [`& .${selectClasses.icon}`]: { top: "auto", color: "inherit" },
} as const;

const selectSx = {
    [`& .${selectClasses.select}.${inputBaseClasses.input}`]: {
        minHeight: 0,
        color: muiGreyPalette[600],
        minWidth: 180,
        lineHeight: "24px",
        fontSize: 14,
        p: 0,
    },
} as const;

export const TipTapRichTextEditorToolbar = ({
    editor,
    resolvedOptions,
    canTranslate,
    onTranslateClick,
}: {
    editor: Editor;
    resolvedOptions: TipTapResolvedOptions;
    canTranslate?: boolean;
    onTranslateClick?: () => void;
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
        icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
        label: ReactNode;
        isActive: boolean;
        onToggle: () => void;
    }[] = [
        ...(resolvedOptions.sup
            ? [
                  {
                      key: "superscript",
                      icon: RteSup,
                      label: <FormattedMessage id="dextinity.blocks.tipTapRichText.superscript.label" defaultMessage="Superscript" />,
                      isActive: editorState.isSuperscriptActive,
                      onToggle: () => editor.chain().focus().toggleSuperscript().run(),
                  },
              ]
            : []),
        ...(resolvedOptions.sub
            ? [
                  {
                      key: "subscript",
                      icon: RteSub,
                      label: <FormattedMessage id="dextinity.blocks.tipTapRichText.subscript.label" defaultMessage="Subscript" />,
                      isActive: editorState.isSubscriptActive,
                      onToggle: () => editor.chain().focus().toggleSubscript().run(),
                  },
              ]
            : []),
        ...applicableInlineStyles.map((style) => ({
            key: style.name,
            icon: style.icon,
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
        <Box
            className="DextinityAdminTipTapToolbar-root"
            sx={{
                display: "flex",
                flexWrap: "wrap",
                position: "sticky",
                top: 0,
                zIndex: 2,
                borderTop: `1px solid ${greyPalette[100]}`,
                backgroundColor: muiGreyPalette[100],
                px: "6px",
            }}
        >
            {resolvedOptions.undoRedoButtons && (
                <ToolbarGroup>
                    <ToolbarButton
                        editor={editor}
                        icon={RteUndo}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.undo.tooltip" defaultMessage="Undo" />}
                        disabled={!editorState.canUndo}
                        onToggle={() => editor.chain().focus().undo().run()}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={RteRedo}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.redo.tooltip" defaultMessage="Redo" />}
                        disabled={!editorState.canRedo}
                        onToggle={() => editor.chain().focus().redo().run()}
                    />
                </ToolbarGroup>
            )}
            {textBlocks.length > 1 && (
                <ToolbarGroup>
                    <FormControl sx={selectFormControlSx}>
                        <Select
                            value={editorState.activeTextBlock}
                            onChange={handleTextBlockChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                            sx={selectSx}
                        >
                            {textBlocks.map((textBlock) => (
                                <MenuItem key={textBlock.name} value={textBlock.name} dense>
                                    {textBlock.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </ToolbarGroup>
            )}
            {hasTextBlockStyles(styledNodes) && (
                <ToolbarGroup>
                    <FormControl sx={selectFormControlSx}>
                        <Select
                            value={editorState.activeTextBlockStyle}
                            disabled={applicableTextBlockStyles.length === 0}
                            onChange={handleTextBlockStyleChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                            sx={selectSx}
                        >
                            {activeDefaultStyle === null && (
                                <MenuItem value="" dense>
                                    <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockStyle.default" defaultMessage="Default" />
                                </MenuItem>
                            )}
                            {applicableTextBlockStyles.map((style) => (
                                <MenuItem key={style.name} value={style.name} dense>
                                    {style.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </ToolbarGroup>
            )}
            {canTranslate && (
                <ToolbarGroup>
                    <ToolbarButton
                        editor={editor}
                        icon={Translate}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.translate.tooltip" defaultMessage="Translate" />}
                        onToggle={() => onTranslateClick?.()}
                    />
                </ToolbarGroup>
            )}
            {(hasInlineFormatButtons || moreOptions || applicableInlineStyles.length > 0) && (
                <ToolbarGroup>
                    {resolvedOptions.bold && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteBold}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.bold.tooltip" defaultMessage="Bold" />}
                            isActive="bold"
                            onToggle={() => editor.chain().focus().toggleBold().run()}
                        />
                    )}
                    {resolvedOptions.italic && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteItalic}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.italic.tooltip" defaultMessage="Italic" />}
                            isActive="italic"
                            onToggle={() => editor.chain().focus().toggleItalic().run()}
                        />
                    )}
                    {resolvedOptions.underline && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteUnderlined}
                            tooltip={<FormattedMessage id="dextintiy.blocks.tipTapRichText.underline.tooltip" defaultMessage="Underline" />}
                            isActive="underline"
                            onToggle={() => editor.chain().focus().toggleUnderline().run()}
                        />
                    )}
                    {resolvedOptions.strike && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteStrikethrough}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.strike.tooltip" defaultMessage="Strikethrough" />}
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

                                        icon={item.icon!}
                                        tooltip={item.label}
                                        isActive={item.isActive}
                                        onToggle={item.onToggle}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                <TipTapRichTextEditorToolbarButton
                                    icon={<MoreHorizontal />}
                                    tooltip={
                                        <FormattedMessage id="dextinity.blocks.tipTapRichText.moreOptions.tooltip" defaultMessage="More options" />
                                    }
                                    ariaLabel={intl.formatMessage({
                                        id: "dextinity.blocks.tipTapRichText.moreOptions.tooltip",
                                        defaultMessage: "More options",
                                    })}
                                    onClick={(e) => setMoreAnchorEl(e.currentTarget)}
                                />
                                <Menu open={Boolean(moreAnchorEl)} anchorEl={moreAnchorEl} onClose={handleMoreClose}>
                                    {moreOptionsItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <MenuItem
                                                key={item.key}
                                                selected={item.isActive}
                                                onMouseDown={() => runMenuItemAction(item.onToggle)}
                                                onClick={(e) => handleMenuItemKeyboardActivate(e, item.onToggle)}
                                            >
                                                {Icon && (
                                                    <ListItemIcon>
                                                        <Icon />
                                                    </ListItemIcon>
                                                )}
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
                <ToolbarGroup>
                    {resolvedOptions.textAlign.map((textAlign) => (
                        <ToolbarButton
                            key={textAlign}
                            editor={editor}
                            icon={textAlignIcons[textAlign]}
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
                <ToolbarGroup>
                    {resolvedOptions.orderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteOl}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.orderedList.tooltip" defaultMessage="Ordered list" />}
                            isActive="orderedList"
                            onToggle={() => handleListToggle(resolvedOptions.orderedList as TipTapResolvedList)}
                        />
                    )}
                    {resolvedOptions.unorderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteUl}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.bulletList.tooltip" defaultMessage="Bullet list" />}
                            isActive="bulletList"
                            onToggle={() => handleListToggle(resolvedOptions.unorderedList as TipTapResolvedList)}
                        />
                    )}
                    <ToolbarButton
                        editor={editor}
                        icon={RteIndentIncrease}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.indent.tooltip" defaultMessage="Increase indent" />}
                        disabled={!editorState.canIndent}
                        onToggle={() => editor.chain().focus().sinkListItem("listItem").run()}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={RteIndentDecrease}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.dedent.tooltip" defaultMessage="Decrease indent" />}
                        disabled={!editorState.canDedent}
                        onToggle={() => editor.chain().focus().liftListItem("listItem").run()}
                    />
                </ToolbarGroup>
            )}
            {link && (
                <ToolbarGroup>
                    <ToolbarButton
                        editor={editor}
                        icon={RteLink}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.link.tooltip" defaultMessage="Link" />}
                        isActive="link"
                        disabled={editorState.selectionEmpty && !editorState.isLinkActive}
                        onToggle={() => setLinkDialogOpen(true)}
                    />
                    <ToolbarButton
                        editor={editor}
                        icon={RteClearLink}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.removeLink.tooltip" defaultMessage="Remove link" />}
                        disabled={!editorState.isLinkActive}
                        onToggle={() => editor.chain().focus().extendMarkRange("link").unsetLinkData().run()}
                    />
                </ToolbarGroup>
            )}
            {hasPlaceholders && (
                <ToolbarGroup>
                    <TipTapRichTextEditorToolbarButton
                        icon={<RteTextPlaceholder />}
                        tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.placeholder.tooltip" defaultMessage="Insert placeholder" />}
                        ariaLabel={intl.formatMessage({
                            id: "dextinity.blocks.tipTapRichText.placeholder.tooltip",
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
                <ToolbarGroup>
                    {resolvedOptions.nonBreakingSpace && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteNonBreakingSpace}
                            tooltip={
                                <FormattedMessage
                                    id="dextinity.blocks.tipTapRichText.nonBreakingSpace.tooltip"
                                    defaultMessage="Insert a non-breaking space"
                                />
                            }
                            onToggle={() => editor.chain().focus().insertNonBreakingSpace().run()}
                        />
                    )}
                    {resolvedOptions.softHyphen && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteSoftHyphen}
                            tooltip={
                                <FormattedMessage id="dextinity.blocks.tipTapRichText.softHyphen.tooltip" defaultMessage="Insert a soft hyphen" />
                            }
                            onToggle={() => editor.chain().focus().insertSoftHyphen().run()}
                        />
                    )}
                </ToolbarGroup>
            )}
            {ToolbarItems && (
                <ToolbarGroup>
                    <ToolbarItems editor={editor} />
                </ToolbarGroup>
            )}
            {linkDialogOpen && link && <LinkDialog editor={editor} link={link} onClose={() => setLinkDialogOpen(false)} />}
        </Box>
    );
};
