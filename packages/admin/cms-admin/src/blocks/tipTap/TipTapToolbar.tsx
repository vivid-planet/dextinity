import {
    formatShortcut,
    Icon,
    isApplePlatform,
    MenuCheckboxItem,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    Toolbar,
    ToolbarButton,
    ToolbarGroup,
    ToolbarMenu,
    ToolbarSeparator,
} from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type Editor, useEditorState } from "@tiptap/react";
import { Fragment, type ReactElement, type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { stickyTopVariable } from "../common/stickyTopVariable";
import { messageText } from "../form/messageText";
import type { BlockInterface, BlockState, LinkBlockInterface } from "../types";
import type { TipTapChildBlock, TipTapInlineStyle, TipTapPlaceholder, TipTapResolvedOptions } from "./createTipTapRichTextBlock";
import { toggleTextBlockList } from "./extensions/TextBlockList";
import { findListNodeType } from "./findListNodeType";
import { liftOutOfList } from "./liftOutOfList";
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
import { TipTapBlockDialog } from "./TipTapBlockDialog";
import { TipTapLinkDialog } from "./TipTapLinkDialog";
import { updateTextBlockStyles } from "./updateTextBlockStyles";

type ToolbarMenuName = "textBlock" | "textBlockStyle" | "moreOptions" | "placeholder" | "childBlock";

interface MoreOptionsItem {
    key: string;
    icon?: ReactNode;
    label: string;
    isActive: boolean;
    onToggle: () => void;
}

function shortcutLabel(shortcut: string) {
    return formatShortcut(shortcut).join(isApplePlatform() ? "" : "+");
}

export const TipTapToolbar = ({
    editor,
    resolvedOptions,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    listLevelMax,
    canTranslate,
    onTranslateClick,
}: {
    editor: Editor;
    resolvedOptions: TipTapResolvedOptions;
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    listLevelMax?: number;
    canTranslate?: boolean;
    onTranslateClick?: () => void;
}) => {
    const intl = useIntl();
    const [openMenu, setOpenMenu] = useState<ToolbarMenuName | null>(null);
    const [insertChildBlock, setInsertChildBlock] = useState<({ key: string } & TipTapChildBlock) | null>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const hasInlineFormatButtons = resolvedOptions.bold || resolvedOptions.italic || resolvedOptions.underline || resolvedOptions.strike;
    const moreOptions = resolvedOptions.sub || resolvedOptions.sup;
    const lists = resolvedOptions.orderedList || resolvedOptions.unorderedList;
    const specialChars = resolvedOptions.nonBreakingSpace || resolvedOptions.softHyphen;
    const hasLink = resolvedOptions.link && !!linkBlock;
    const textBlocks = resolvedOptions.textBlocks;
    const styledNodes = getStyledNodes(resolvedOptions);
    const hasPlaceholders = placeholders.length > 0;
    const hasChildBlocks = Object.keys(childBlocks).length > 0;

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

    const label = (descriptor: { id: string; defaultMessage: string }) => intl.formatMessage(descriptor);
    const textOf = (node: ReactNode, fallback: string) => messageText(intl, node) ?? fallback;

    const handleMenuOpenChange = (menu: ToolbarMenuName) => (open: boolean) => setOpenMenu(open ? menu : null);

    // The menu hands the focus back to its trigger as it closes, so the editor is focused - with its selection - afterwards.
    const runAfterMenuCloses = (action: () => void) => {
        setOpenMenu(null);
        setTimeout(action, 0);
    };

    const activeStyledNode = styledNodes.find((styledNode) => styledNode.name === editorState.activeStyledNode);
    const applicableTextBlockStyles = activeStyledNode?.styles ?? [];
    // A configured default style means every text block of that type has one, so the styling menu
    // drops its "Default" entry and the choice becomes mandatory.
    const activeDefaultStyle = activeStyledNode?.defaultStyle ?? null;
    const applicableInlineStyles = inlineStyles.filter((style) => !style.appliesTo || style.appliesTo.includes(editorState.activeStyledNode));
    // Without bold/italic/underline/strike buttons to fold behind it, a "..." menu just for superscript/subscript/inline
    // styles adds an extra click for no space savings, so show them as individual buttons instead
    const showMoreOptionsAsButtons = !hasInlineFormatButtons && inlineStyles.every((style) => style.icon);

    const defaultStyleLabel = label({ id: "dextinity.blocks.tipTapRichText.textBlockStyle.default", defaultMessage: "Default" });
    const activeTextBlock = textBlocks.find((textBlock) => textBlock.name === editorState.activeTextBlock);
    const activeTextBlockStyle = applicableTextBlockStyles.find((style) => style.name === editorState.activeTextBlockStyle);

    const moreOptionsItems: MoreOptionsItem[] = [
        ...(resolvedOptions.sup
            ? [
                  {
                      key: "superscript",
                      icon: <Icon name="rte-sup" />,
                      label: label({ id: "dextinity.blocks.tipTapRichText.superscript.label", defaultMessage: "Superscript" }),
                      isActive: editorState.isSuperscriptActive,
                      onToggle: () => editor.chain().focus().toggleSuperscript().run(),
                  },
              ]
            : []),
        ...(resolvedOptions.sub
            ? [
                  {
                      key: "subscript",
                      icon: <Icon name="rte-sub" />,
                      label: label({ id: "dextinity.blocks.tipTapRichText.subscript.label", defaultMessage: "Subscript" }),
                      isActive: editorState.isSubscriptActive,
                      onToggle: () => editor.chain().focus().toggleSubscript().run(),
                  },
              ]
            : []),
        ...applicableInlineStyles.map((style) => ({
            key: style.name,
            icon: style.icon,
            label: textOf(style.label, style.name),
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

    const handleTextBlockChange = (name: string) => {
        const textBlock = textBlocks.find((candidate: TipTapResolvedTextBlock) => candidate.name === name);
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

    const handleTextBlockStyleChange = (styleName: string) => {
        editor
            .chain()
            .focus()
            .updateAttributes("textBlock", { textBlockStyle: styleName || null })
            .run();
    };

    const groups: { key: string; content: ReactElement }[] = [];

    if (resolvedOptions.undoRedoButtons) {
        groups.push({
            key: "history",
            content: (
                <ToolbarGroup aria-label={label({ id: "dextinity.blocks.tipTapRichText.history", defaultMessage: "History" })}>
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.undo.tooltip", defaultMessage: "Undo" })}
                        shortcut={shortcutLabel("mod+z")}
                        disabled={!editorState.canUndo}
                        keepFocus
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        <Icon name="rte-undo" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.redo.tooltip", defaultMessage: "Redo" })}
                        shortcut={shortcutLabel("shift+mod+z")}
                        disabled={!editorState.canRedo}
                        keepFocus
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        <Icon name="rte-redo" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }

    if (textBlocks.length > 1) {
        groups.push({
            key: "textBlock",
            content: (
                <ToolbarMenu
                    label={activeTextBlock?.label}
                    aria-label={label({ id: "dextinity.blocks.tipTapRichText.textBlock", defaultMessage: "Text type" })}
                    open={openMenu === "textBlock"}
                    onOpenChange={handleMenuOpenChange("textBlock")}
                >
                    <MenuRadioGroup value={editorState.activeTextBlock} onChange={(name) => runAfterMenuCloses(() => handleTextBlockChange(name))}>
                        {textBlocks.map((textBlock) => (
                            <MenuRadioItem key={textBlock.name} value={textBlock.name} label={textOf(textBlock.label, textBlock.name)} />
                        ))}
                    </MenuRadioGroup>
                </ToolbarMenu>
            ),
        });
    }

    if (hasTextBlockStyles(styledNodes)) {
        groups.push({
            key: "textBlockStyle",
            content: (
                <ToolbarMenu
                    label={activeTextBlockStyle?.label ?? defaultStyleLabel}
                    aria-label={label({ id: "dextinity.blocks.tipTapRichText.textBlockStyle", defaultMessage: "Text style" })}
                    disabled={applicableTextBlockStyles.length === 0}
                    open={openMenu === "textBlockStyle"}
                    onOpenChange={handleMenuOpenChange("textBlockStyle")}
                >
                    <MenuRadioGroup
                        value={editorState.activeTextBlockStyle}
                        onChange={(styleName) => runAfterMenuCloses(() => handleTextBlockStyleChange(styleName))}
                    >
                        {activeDefaultStyle === null && <MenuRadioItem value="" label={defaultStyleLabel} />}
                        {applicableTextBlockStyles.map((style) => (
                            <MenuRadioItem key={style.name} value={style.name} label={textOf(style.label, style.name)} />
                        ))}
                    </MenuRadioGroup>
                </ToolbarMenu>
            ),
        });
    }

    if (canTranslate) {
        groups.push({
            key: "translate",
            content: (
                <ToolbarButton
                    aria-label={label({ id: "dextinity.blocks.tipTapRichText.translate.tooltip", defaultMessage: "Translate" })}
                    onClick={() => onTranslateClick?.()}
                >
                    <Icon name="translate" />
                </ToolbarButton>
            ),
        });
    }

    if (hasInlineFormatButtons || moreOptions || applicableInlineStyles.length > 0) {
        groups.push({
            key: "formatting",
            content: (
                <ToolbarGroup aria-label={label({ id: "dextinity.blocks.tipTapRichText.formatting", defaultMessage: "Formatting" })}>
                    {resolvedOptions.bold && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.bold.tooltip", defaultMessage: "Bold" })}
                            shortcut={shortcutLabel("mod+b")}
                            pressed={editorState.isBoldActive}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Icon name="rte-bold" />
                        </ToolbarButton>
                    )}
                    {resolvedOptions.italic && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.italic.tooltip", defaultMessage: "Italic" })}
                            shortcut={shortcutLabel("mod+i")}
                            pressed={editorState.isItalicActive}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Icon name="rte-italic" />
                        </ToolbarButton>
                    )}
                    {resolvedOptions.underline && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.underline.tooltip", defaultMessage: "Underline" })}
                            shortcut={shortcutLabel("mod+u")}
                            pressed={editorState.isUnderlineActive}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        >
                            <Icon name="rte-underlined" />
                        </ToolbarButton>
                    )}
                    {resolvedOptions.strike && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.strike.tooltip", defaultMessage: "Strikethrough" })}
                            shortcut={shortcutLabel("shift+mod+s")}
                            pressed={editorState.isStrikeActive}
                            keepFocus
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                        >
                            <Icon name="rte-strikethrough" />
                        </ToolbarButton>
                    )}
                    {moreOptionsItems.length > 0 &&
                        (showMoreOptionsAsButtons ? (
                            moreOptionsItems.map((item) => (
                                <ToolbarButton key={item.key} aria-label={item.label} pressed={item.isActive} keepFocus onClick={item.onToggle}>
                                    {item.icon}
                                </ToolbarButton>
                            ))
                        ) : (
                            <ToolbarMenu
                                icon={<Icon name="more-horizontal" />}
                                aria-label={label({ id: "dextinity.blocks.tipTapRichText.moreOptions.tooltip", defaultMessage: "More options" })}
                                open={openMenu === "moreOptions"}
                                onOpenChange={handleMenuOpenChange("moreOptions")}
                            >
                                {moreOptionsItems.map((item) => (
                                    <MenuCheckboxItem
                                        key={item.key}
                                        icon={item.icon}
                                        label={item.label}
                                        checked={item.isActive}
                                        closeOnClick
                                        onChange={() => runAfterMenuCloses(item.onToggle)}
                                    />
                                ))}
                            </ToolbarMenu>
                        ))}
                </ToolbarGroup>
            ),
        });
    }

    if (lists) {
        groups.push({
            key: "lists",
            content: (
                <ToolbarGroup aria-label={label({ id: "dextinity.blocks.tipTapRichText.lists", defaultMessage: "Lists" })}>
                    {resolvedOptions.orderedList && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.orderedList.tooltip", defaultMessage: "Ordered list" })}
                            shortcut={shortcutLabel("shift+mod+7")}
                            pressed={editorState.isOrderedListActive}
                            keepFocus
                            onClick={() => handleListToggle(resolvedOptions.orderedList as TipTapResolvedList)}
                        >
                            <Icon name="rte-ol" />
                        </ToolbarButton>
                    )}
                    {resolvedOptions.unorderedList && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.bulletList.tooltip", defaultMessage: "Bullet list" })}
                            shortcut={shortcutLabel("shift+mod+8")}
                            pressed={editorState.isBulletListActive}
                            keepFocus
                            onClick={() => handleListToggle(resolvedOptions.unorderedList as TipTapResolvedList)}
                        >
                            <Icon name="rte-ul-bullet-point" />
                        </ToolbarButton>
                    )}
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.indent.tooltip", defaultMessage: "Increase indent" })}
                        shortcut={shortcutLabel("Tab")}
                        disabled={!editorState.canIndent}
                        keepFocus
                        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
                    >
                        <Icon name="rte-indent-increase" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.dedent.tooltip", defaultMessage: "Decrease indent" })}
                        shortcut={shortcutLabel("shift+Tab")}
                        disabled={!editorState.canDedent}
                        keepFocus
                        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
                    >
                        <Icon name="rte-indent-decrease" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }

    if (hasLink) {
        groups.push({
            key: "link",
            content: (
                <ToolbarGroup aria-label={label({ id: "dextinity.blocks.tipTapRichText.links", defaultMessage: "Links" })}>
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.link.tooltip", defaultMessage: "Link" })}
                        pressed={editorState.isLinkActive}
                        disabled={editorState.selectionEmpty && !editorState.isLinkActive}
                        keepFocus
                        onClick={() => setLinkDialogOpen(true)}
                    >
                        <Icon name="rte-link" />
                    </ToolbarButton>
                    <ToolbarButton
                        aria-label={label({ id: "dextinity.blocks.tipTapRichText.removeLink.tooltip", defaultMessage: "Remove link" })}
                        disabled={!editorState.isLinkActive}
                        keepFocus
                        onClick={() => editor.chain().focus().extendMarkRange("link").unsetCmsLink().run()}
                    >
                        <Icon name="rte-clear-link" />
                    </ToolbarButton>
                </ToolbarGroup>
            ),
        });
    }

    if (hasPlaceholders) {
        groups.push({
            key: "placeholder",
            content: (
                <ToolbarMenu
                    icon={<Icon name="rte-text-placeholder" />}
                    aria-label={label({ id: "dextinity.blocks.tipTapRichText.placeholder.tooltip", defaultMessage: "Insert placeholder" })}
                    open={openMenu === "placeholder"}
                    onOpenChange={handleMenuOpenChange("placeholder")}
                >
                    {placeholders.map((placeholder) => (
                        <MenuItem
                            key={placeholder.name}
                            label={textOf(placeholder.label, placeholder.name)}
                            onClick={() => runAfterMenuCloses(() => editor.chain().focus().insertPlaceholder(placeholder.name).run())}
                        />
                    ))}
                </ToolbarMenu>
            ),
        });
    }

    if (specialChars) {
        groups.push({
            key: "specialCharacters",
            content: (
                <ToolbarGroup aria-label={label({ id: "dextinity.blocks.tipTapRichText.specialCharacters", defaultMessage: "Special characters" })}>
                    {resolvedOptions.nonBreakingSpace && (
                        <ToolbarButton
                            aria-label={label({
                                id: "dextinity.blocks.tipTapRichText.nonBreakingSpace.tooltip",
                                defaultMessage: "Insert a non-breaking space",
                            })}
                            keepFocus
                            onClick={() => editor.chain().focus().insertNonBreakingSpace().run()}
                        >
                            <Icon name="rte-non-breaking-space" />
                        </ToolbarButton>
                    )}
                    {resolvedOptions.softHyphen && (
                        <ToolbarButton
                            aria-label={label({ id: "dextinity.blocks.tipTapRichText.softHyphen.tooltip", defaultMessage: "Insert a soft hyphen" })}
                            keepFocus
                            onClick={() => editor.chain().focus().insertSoftHyphen().run()}
                        >
                            <Icon name="rte-soft-hyphen" />
                        </ToolbarButton>
                    )}
                </ToolbarGroup>
            ),
        });
    }

    if (hasChildBlocks) {
        groups.push({
            key: "childBlock",
            content: (
                <ToolbarMenu
                    icon={<Icon name="plus" />}
                    aria-label={label({ id: "dextinity.blocks.tipTapRichText.insertBlock.tooltip", defaultMessage: "Insert block" })}
                    open={openMenu === "childBlock"}
                    onOpenChange={handleMenuOpenChange("childBlock")}
                >
                    {Object.entries(childBlocks).map(([key, childBlock]) => (
                        <MenuItem
                            key={key}
                            label={textOf(childBlock.block.displayName, key)}
                            onClick={() => {
                                // The dialog takes the focus; refocusing the editor would steal it back
                                setOpenMenu(null);
                                setInsertChildBlock({ key, ...childBlock });
                            }}
                        />
                    ))}
                </ToolbarMenu>
            ),
        });
    }

    return (
        <>
            <StickyToolbar aria-label={label({ id: "dextinity.blocks.tipTapRichText.toolbar", defaultMessage: "Rich text formatting" })}>
                {groups.map((group, index) => (
                    <Fragment key={group.key}>
                        {index > 0 && <ToolbarSeparator />}
                        {group.content}
                    </Fragment>
                ))}
            </StickyToolbar>
            {linkDialogOpen && linkBlock && <TipTapLinkDialog editor={editor} linkBlock={linkBlock} onClose={() => setLinkDialogOpen(false)} />}
            {insertChildBlock && (
                <TipTapBlockDialog
                    block={insertChildBlock.block}
                    initialState={insertChildBlock.block.defaultValues() as BlockState<typeof insertChildBlock.block>}
                    isEditing={false}
                    onSubmit={(data) => {
                        const attrs = { blockType: insertChildBlock.key, data };
                        if (insertChildBlock.display === "inline") {
                            editor.commands.insertCmsInlineBlock(attrs);
                        } else {
                            editor.commands.insertCmsBlock(attrs);
                        }
                    }}
                    onClose={() => setInsertChildBlock(null)}
                />
            )}
        </>
    );
};

const StickyToolbar = styled(Toolbar)`
    position: sticky;
    top: var(${stickyTopVariable}, 0px);
    z-index: 2;
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
    background: inherit;
    box-shadow: inset 0 calc(var(--dextinity-line-width) * -1) 0 var(--dextinity-color-line);
`;
