import { greyPalette, Tooltip } from "@dextinity/admin";
import {
    Add,
    MoreHorizontal,
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
import { FormattedMessage, useIntl } from "react-intl";

import type { BlockInterface, BlockState, LinkBlockInterface } from "../types";
import type {
    TipTapChildBlock,
    TipTapInlineStyle,
    TipTapPlaceholder,
    TipTapResolvedOptions,
    TipTapTextBlockStyle,
    TipTapTextBlockStyleTargetType,
    TipTapTextBlockType,
} from "./createTipTapRichTextBlock";
import { TipTapBlockDialog } from "./TipTapBlockDialog";
import { TipTapLinkDialog } from "./TipTapLinkDialog";

const toolbarButtonSx = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 24,
    padding: 0,
    backgroundColor: "transparent",
    border: "1px solid transparent",
    boxSizing: "border-box",
    transition: "background-color 200ms, border-color 200ms, color 200ms",
    color: muiGreyPalette[600],
    "&:hover": {
        backgroundColor: muiGreyPalette[200],
        borderColor: muiGreyPalette[400],
    },
    "&:disabled": {
        color: muiGreyPalette[300],
        "&, &:hover": {
            backgroundColor: "transparent",
            borderColor: "transparent",
        },
    },
} as const;

const toolbarButtonSelectedSx = {
    "&:not(:disabled), &:not(:disabled):hover": {
        borderColor: muiGreyPalette[400],
        backgroundColor: "white",
    },
} as const;

const ToolbarButton = ({
    editor,
    icon: Icon,
    tooltip,
    isActive,
    disabled,
    onToggle,
}: {
    editor: Editor;
    icon: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
    tooltip: ReactNode;
    isActive?: string | boolean;
    disabled?: boolean;
    onToggle: () => void;
}) => (
    <Tooltip title={tooltip}>
        <Box
            component="button"
            type="button"
            disabled={disabled}
            onMouseDown={(e: MouseEvent) => {
                e.preventDefault();
                onToggle();
            }}
            sx={{
                ...toolbarButtonSx,
                ...((typeof isActive === "string" ? editor.isActive(isActive) : isActive) ? toolbarButtonSelectedSx : {}),
            }}
        >
            <Icon sx={{ fontSize: 15 }} color="inherit" />
        </Box>
    </Tooltip>
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

export const TipTapToolbar = ({
    editor,
    resolvedOptions,
    textBlockStyles,
    defaultTextBlockStyles,
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
    textBlockStyles: TipTapTextBlockStyle[];
    defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>;
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    listLevelMax?: number;
    canTranslate?: boolean;
    onTranslateClick?: () => void;
}) => {
    const intl = useIntl();
    const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
    const [placeholderAnchorEl, setPlaceholderAnchorEl] = useState<null | HTMLElement>(null);
    const [childBlockAnchorEl, setChildBlockAnchorEl] = useState<null | HTMLElement>(null);
    const [insertChildBlock, setInsertChildBlock] = useState<({ key: string } & TipTapChildBlock) | null>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const hasInlineFormatButtons = resolvedOptions.bold || resolvedOptions.italic || resolvedOptions.underline || resolvedOptions.strike;
    const moreOptions = resolvedOptions.sub || resolvedOptions.sup;
    const lists = resolvedOptions.orderedList || resolvedOptions.unorderedList;
    const specialChars = resolvedOptions.nonBreakingSpace || resolvedOptions.softHyphen;
    const hasLink = resolvedOptions.link && !!linkBlock;
    const headingLevels = resolvedOptions.heading ? resolvedOptions.heading.levels : [];
    const hasParagraph = resolvedOptions.paragraph;
    const hasPlaceholders = placeholders.length > 0;
    const hasChildBlocks = Object.keys(childBlocks).length > 0;

    const textBlockTypeSelectStylesByTag = textBlockStyles.reduce((map, style) => {
        if (style.isTextBlockType && style.appliesTo?.length === 1) {
            const tag = style.appliesTo[0] as TipTapTextBlockStyleTargetType;
            map.set(tag, [...(map.get(tag) ?? []), style]);
        }
        return map;
    }, new Map<TipTapTextBlockStyleTargetType, TipTapTextBlockStyle[]>());

    const editorState = useEditorState({
        editor,
        selector: ({ editor: e }: { editor: Editor }) => {
            const activeHeadingLevel = (() => {
                for (let level = 1; level <= 6; level++) {
                    if (e.isActive("heading", { level })) {
                        return level;
                    }
                }
                return undefined;
            })();
            const activeTipTapTextBlockType: TipTapTextBlockType = (() => {
                if (e.isActive("orderedList")) {
                    return "ordered-list";
                }
                if (e.isActive("bulletList")) {
                    return "unordered-list";
                }
                return activeHeadingLevel !== undefined ? (`heading-${activeHeadingLevel}` as TipTapTextBlockType) : "paragraph";
            })();
            const attrs = e.isActive("heading") || !hasParagraph ? e.getAttributes("heading") : e.getAttributes("paragraph");
            const activeTextBlockStyleName = (attrs.textBlockStyle as string) ?? "";

            // The type select's value: the tag alone ("paragraph"/"1".."6"), or "<tag>:<styleName>" when the
            // current node's style is one promoted into this dropdown (see TipTapTextBlockStyle.isTextBlockType).
            const activeTextBlockType = (() => {
                const tag =
                    activeHeadingLevel !== undefined
                        ? String(activeHeadingLevel)
                        : hasParagraph || resolvedOptions.heading === false
                          ? "paragraph"
                          : String(resolvedOptions.heading.defaultLevel);
                const targetType: TipTapTextBlockStyleTargetType =
                    tag === "paragraph" ? "paragraph" : (`heading-${tag}` as TipTapTextBlockStyleTargetType);
                const typeSelectStyle = textBlockTypeSelectStylesByTag.get(targetType)?.find((style) => style.name === activeTextBlockStyleName);
                return typeSelectStyle ? `${tag}:${typeSelectStyle.name}` : tag;
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
                activeTextBlockType,
                activeTipTapTextBlockType,
                activeTextBlockStyle: activeTextBlockStyleName,
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

    const handleChildBlockClose = () => {
        setChildBlockAnchorEl(null);
        setTimeout(() => editor.commands.focus(), 0);
    };

    const applicableTextBlockStyles = textBlockStyles.filter(
        (style) => !style.isTextBlockType && (!style.appliesTo || style.appliesTo.includes(editorState.activeTipTapTextBlockType)),
    );

    // A flat array, not JSX with nested fragments: MUI's Select reads its popup items via
    // `React.Children.toArray(children)`, which flattens arrays but leaves `<Fragment>` wrappers as a single
    // opaque child, so a per-tag fragment grouping a promoted style with its plain entry wouldn't render.
    const textBlockTypeMenuItems = [
        ...(hasParagraph
            ? [
                  ...(textBlockTypeSelectStylesByTag.get("paragraph") ?? []).map((style) => (
                      <MenuItem key={`paragraph:${style.name}`} value={`paragraph:${style.name}`} dense>
                          {style.label}
                      </MenuItem>
                  )),
                  <MenuItem key="paragraph" value="paragraph" dense>
                      <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.paragraph" defaultMessage="Paragraph" />
                  </MenuItem>,
              ]
            : []),
        ...headingLevels.flatMap((level) => [
            ...(textBlockTypeSelectStylesByTag.get(`heading-${level}` as TipTapTextBlockStyleTargetType) ?? []).map((style) => (
                <MenuItem key={`${level}:${style.name}`} value={`${level}:${style.name}`} dense>
                    {style.label}
                </MenuItem>
            )),
            <MenuItem key={level} value={String(level)} dense>
                <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.heading" defaultMessage="Heading {level}" values={{ level }} />
            </MenuItem>,
        ]),
    ];
    const applicableInlineStyles = inlineStyles.filter(
        (style) => !style.appliesTo || style.appliesTo.includes(editorState.activeTipTapTextBlockType),
    );
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

    const handleTextBlockTypeChange = (e: SelectChangeEvent) => {
        // The value is "<tag>" (e.g. "paragraph", "2") or "<tag>:<styleName>" for a style promoted into this
        // dropdown via `isTextBlockType` (see textBlockTypeSelectStylesByTag).
        const [tagKey, typeSelectStyleName] = e.target.value.split(":");
        const nodeType = tagKey === "paragraph" ? "paragraph" : "heading";
        const targetType: TipTapTextBlockStyleTargetType =
            tagKey === "paragraph" ? "paragraph" : (`heading-${tagKey}` as TipTapTextBlockStyleTargetType);

        let chain = editor.chain().focus();
        chain = tagKey === "paragraph" ? chain.setParagraph() : chain.setHeading({ level: Number(tagKey) as 1 | 2 | 3 | 4 | 5 | 6 });

        if (typeSelectStyleName) {
            chain = chain.updateAttributes(nodeType, { textBlockStyle: typeSelectStyleName });
        } else if (textBlockTypeSelectStylesByTag.has(targetType)) {
            // This tag's plain entry always means no style, once one of its styles is promoted into this dropdown.
            if (editorState.activeTextBlockStyle) {
                chain = chain.updateAttributes(nodeType, { textBlockStyle: null });
            }
        } else if (editorState.activeTextBlockStyle) {
            // Clear textBlockStyle if it's not applicable to the new text block type
            const styleConfig = textBlockStyles.find((s) => s.name === editorState.activeTextBlockStyle);
            if (styleConfig?.appliesTo && !styleConfig.appliesTo.includes(targetType)) {
                chain = chain.updateAttributes(nodeType, { textBlockStyle: null });
            }
        }

        chain.run();
    };

    const handleTextBlockStyleChange = (e: SelectChangeEvent) => {
        const value = e.target.value || null;
        const nodeType = editor.isActive("heading") || !hasParagraph ? "heading" : "paragraph";
        editor.chain().focus().updateAttributes(nodeType, { textBlockStyle: value }).run();
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
            {resolvedOptions.heading && (
                <ToolbarGroup>
                    <FormControl sx={selectFormControlSx}>
                        <Select
                            value={editorState.activeTextBlockType}
                            onChange={handleTextBlockTypeChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                            sx={selectSx}
                        >
                            {textBlockTypeMenuItems}
                        </Select>
                    </FormControl>
                </ToolbarGroup>
            )}
            {applicableTextBlockStyles.length > 0 && (
                <ToolbarGroup>
                    <FormControl sx={selectFormControlSx}>
                        <Select
                            value={editorState.activeTextBlockStyle}
                            onChange={handleTextBlockStyleChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                            sx={selectSx}
                        >
                            {!defaultTextBlockStyles[editorState.activeTipTapTextBlockType as TipTapTextBlockStyleTargetType] && (
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
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed by showMoreOptionsAsButtons
                                        icon={item.icon!}
                                        tooltip={item.label}
                                        isActive={item.isActive}
                                        onToggle={item.onToggle}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                <Tooltip
                                    title={
                                        <FormattedMessage id="dextinity.blocks.tipTapRichText.moreOptions.tooltip" defaultMessage="More options" />
                                    }
                                >
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={intl.formatMessage({
                                            id: "dextinity.blocks.tipTapRichText.moreOptions.tooltip",
                                            defaultMessage: "More options",
                                        })}
                                        onMouseDown={(e: MouseEvent) => {
                                            e.preventDefault();
                                            setMoreAnchorEl(e.currentTarget as HTMLElement);
                                        }}
                                        onClick={(e: MouseEvent) => {
                                            if (e.detail === 0) {
                                                setMoreAnchorEl(e.currentTarget as HTMLElement);
                                            }
                                        }}
                                        sx={toolbarButtonSx}
                                    >
                                        <MoreHorizontal sx={{ fontSize: 15 }} color="inherit" />
                                    </Box>
                                </Tooltip>
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
            {lists && (
                <ToolbarGroup>
                    {resolvedOptions.orderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteOl}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.orderedList.tooltip" defaultMessage="Ordered list" />}
                            isActive="orderedList"
                            onToggle={() => editor.chain().focus().toggleOrderedList().run()}
                        />
                    )}
                    {resolvedOptions.unorderedList && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteUl}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.bulletList.tooltip" defaultMessage="Bullet list" />}
                            isActive="bulletList"
                            onToggle={() => editor.chain().focus().toggleBulletList().run()}
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
            {hasLink && linkBlock && (
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
                        onToggle={() => editor.chain().focus().extendMarkRange("link").unsetCmsLink().run()}
                    />
                </ToolbarGroup>
            )}
            {hasPlaceholders && (
                <ToolbarGroup>
                    <Tooltip
                        title={<FormattedMessage id="dextinity.blocks.tipTapRichText.placeholder.tooltip" defaultMessage="Insert placeholder" />}
                    >
                        <Box
                            component="button"
                            type="button"
                            aria-label={intl.formatMessage({
                                id: "dextinity.blocks.tipTapRichText.placeholder.tooltip",
                                defaultMessage: "Insert placeholder",
                            })}
                            onMouseDown={(e: MouseEvent) => {
                                e.preventDefault();
                                setPlaceholderAnchorEl(e.currentTarget as HTMLElement);
                            }}
                            sx={toolbarButtonSx}
                        >
                            <RteTextPlaceholder sx={{ fontSize: 15 }} color="inherit" />
                        </Box>
                    </Tooltip>
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
                            onToggle={() => editor.chain().focus().insertContent({ type: "nonBreakingSpace" }).run()}
                        />
                    )}
                    {resolvedOptions.softHyphen && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteSoftHyphen}
                            tooltip={
                                <FormattedMessage id="dextinity.blocks.tipTapRichText.softHyphen.tooltip" defaultMessage="Insert a soft hyphen" />
                            }
                            onToggle={() => editor.chain().focus().insertContent({ type: "softHyphen" }).run()}
                        />
                    )}
                </ToolbarGroup>
            )}
            {hasChildBlocks && (
                <ToolbarGroup>
                    <Tooltip title={<FormattedMessage id="dextinity.blocks.tipTapRichText.insertBlock.tooltip" defaultMessage="Insert block" />}>
                        <Box
                            component="button"
                            type="button"
                            aria-label={intl.formatMessage({
                                id: "dextinity.blocks.tipTapRichText.insertBlock.tooltip",
                                defaultMessage: "Insert block",
                            })}
                            onMouseDown={(e: MouseEvent) => {
                                e.preventDefault();
                                setChildBlockAnchorEl(e.currentTarget as HTMLElement);
                            }}
                            sx={toolbarButtonSx}
                        >
                            <Add sx={{ fontSize: 15 }} color="inherit" />
                        </Box>
                    </Tooltip>
                    <Menu open={Boolean(childBlockAnchorEl)} anchorEl={childBlockAnchorEl} onClose={handleChildBlockClose}>
                        {Object.entries(childBlocks).map(([key, childBlock]) => (
                            <MenuItem
                                key={key}
                                onClick={() => {
                                    handleChildBlockClose();
                                    setInsertChildBlock({ key, ...childBlock });
                                }}
                            >
                                {childBlock.block.displayName}
                            </MenuItem>
                        ))}
                    </Menu>
                </ToolbarGroup>
            )}
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
        </Box>
    );
};
