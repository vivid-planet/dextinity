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
} from "@dextinity/admin-icons";
import {
    Box,
    FormControl,
    inputBaseClasses,
    ListItemIcon,
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
    TipTapSupports,
    TipTapTextBlockStyle,
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
    isActive?: string;
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
                ...(isActive && editor.isActive(isActive) ? toolbarButtonSelectedSx : {}),
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
    supports,
    textBlockStyles,
    inlineStyles,
    placeholders,
    linkBlock,
    childBlocks,
    listLevelMax,
    requireTextBlockStyle,
}: {
    editor: Editor;
    supports: TipTapSupports[];
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    linkBlock?: BlockInterface & LinkBlockInterface;
    childBlocks: Record<string, TipTapChildBlock>;
    listLevelMax?: number;
    requireTextBlockStyle?: boolean;
}) => {
    const intl = useIntl();
    const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
    const [placeholderAnchorEl, setPlaceholderAnchorEl] = useState<null | HTMLElement>(null);
    const [childBlockAnchorEl, setChildBlockAnchorEl] = useState<null | HTMLElement>(null);
    const [insertChildBlock, setInsertChildBlock] = useState<({ key: string } & TipTapChildBlock) | null>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const hasInlineFormatButtons = (["bold", "italic", "underline", "strike"] as const).some((s) => supports.includes(s));
    const moreOptions = (["sub", "sup"] as const).some((s) => supports.includes(s));
    const lists = (["ordered-list", "unordered-list"] as const).some((s) => supports.includes(s));
    const specialChars = (["non-breaking-space", "soft-hyphen"] as const).some((s) => supports.includes(s));
    const hasLink = supports.includes("link") && !!linkBlock;
    const hasPlaceholders = placeholders.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasChildBlocks = Object.keys(childBlocks).length > 0;

    const editorState = useEditorState({
        editor,
        selector: ({ editor: e }: { editor: Editor }) => {
            const activeTextBlockType = (() => {
                for (let level = 1; level <= 6; level++) {
                    if (e.isActive("heading", { level })) {
                        return String(level);
                    }
                }
                return "paragraph";
            })();
            const activeTipTapTextBlockType: TipTapTextBlockType = (() => {
                if (e.isActive("orderedList")) {
                    return "ordered-list";
                }
                if (e.isActive("bulletList")) {
                    return "unordered-list";
                }
                for (let level = 1; level <= 6; level++) {
                    if (e.isActive("heading", { level })) {
                        return `heading-${level}` as TipTapTextBlockType;
                    }
                }
                return "paragraph";
            })();
            const attrs = e.isActive("heading") ? e.getAttributes("heading") : e.getAttributes("paragraph");
            const activeInlineStyle = (() => {
                if (!hasInlineStyles) {
                    return "";
                }
                const inlineStyleAttrs = e.getAttributes("inlineStyle");
                return (inlineStyleAttrs.type as string) ?? "";
            })();

            // Calculate current list nesting depth for listLevelMax enforcement
            let canIndent = e.can().sinkListItem("listItem");
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
                activeTextBlockStyle: (attrs.textBlockStyle as string) ?? "",
                activeInlineStyle,
                canUndo: e.can().undo(),
                canRedo: e.can().redo(),
                canIndent,
                canDedent: e.can().liftListItem("listItem"),
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
            };
        },
    });

    const handleMoreClose = () => {
        setMoreAnchorEl(null);
        setTimeout(() => editor.commands.focus(), 0);
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
        (style) => !style.appliesTo || style.appliesTo.includes(editorState.activeTipTapTextBlockType),
    );
    const applicableInlineStyles = inlineStyles.filter(
        (style) => !style.appliesTo || style.appliesTo.includes(editorState.activeTipTapTextBlockType),
    );

    const handleTextBlockTypeChange = (e: SelectChangeEvent) => {
        const value = e.target.value;
        if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
        } else {
            editor
                .chain()
                .focus()
                .setHeading({ level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
        }

        // Clear textBlockStyle if it's not applicable to the new text block type
        if (textBlockStyles.length > 0) {
            const { activeTextBlockStyle } = editorState;
            if (activeTextBlockStyle) {
                const newType: TipTapTextBlockType = value === "paragraph" ? "paragraph" : (`heading-${value}` as TipTapTextBlockType);
                const styleConfig = textBlockStyles.find((s) => s.name === activeTextBlockStyle);
                if (styleConfig?.appliesTo && !styleConfig.appliesTo.includes(newType)) {
                    const nodeType = value === "paragraph" ? "paragraph" : "heading";
                    editor.chain().updateAttributes(nodeType, { textBlockStyle: null }).run();
                }
            }
        }
    };

    const handleTextBlockStyleChange = (e: SelectChangeEvent) => {
        const value = e.target.value || null;
        const nodeType = editor.isActive("heading") ? "heading" : "paragraph";
        editor.chain().focus().updateAttributes(nodeType, { textBlockStyle: value }).run();
    };

    const handleInlineStyleChange = (e: SelectChangeEvent) => {
        const value = e.target.value;
        if (value) {
            editor.chain().focus().setInlineStyle({ type: value }).run();
        } else {
            editor.chain().focus().unsetInlineStyle().run();
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                borderTop: `1px solid ${greyPalette[100]}`,
                backgroundColor: muiGreyPalette[100],
                px: "6px",
            }}
        >
            {supports.includes("history") && (
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
            {supports.includes("heading") && (
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
                            <MenuItem value="paragraph" dense>
                                <FormattedMessage id="dextinity.blocks.tipTapRichText.textBlockType.paragraph" defaultMessage="Paragraph" />
                            </MenuItem>
                            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                                <MenuItem key={level} value={String(level)} dense>
                                    <FormattedMessage
                                        id="dextinity.blocks.tipTapRichText.textBlockType.heading"
                                        defaultMessage="Heading {level}"
                                        values={{ level }}
                                    />
                                </MenuItem>
                            ))}
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
                            {!requireTextBlockStyle && (
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
            {applicableInlineStyles.length > 0 && (
                <ToolbarGroup>
                    <FormControl sx={selectFormControlSx}>
                        <Select
                            value={editorState.activeInlineStyle}
                            onChange={handleInlineStyleChange}
                            displayEmpty
                            variant="filled"
                            MenuProps={{ elevation: 1 }}
                            sx={selectSx}
                            disabled={editorState.selectionEmpty}
                        >
                            <MenuItem value="" dense>
                                <FormattedMessage id="dextinity.blocks.tipTapRichText.inlineStyle.default" defaultMessage="Default" />
                            </MenuItem>
                            {applicableInlineStyles.map((style) => (
                                <MenuItem key={style.name} value={style.name} dense>
                                    {style.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </ToolbarGroup>
            )}
            {(hasInlineFormatButtons || moreOptions) && (
                <ToolbarGroup>
                    {supports.includes("bold") && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteBold}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.bold.tooltip" defaultMessage="Bold" />}
                            isActive="bold"
                            onToggle={() => editor.chain().focus().toggleBold().run()}
                        />
                    )}
                    {supports.includes("italic") && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteItalic}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.italic.tooltip" defaultMessage="Italic" />}
                            isActive="italic"
                            onToggle={() => editor.chain().focus().toggleItalic().run()}
                        />
                    )}
                    {supports.includes("underline") && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteUnderlined}
                            tooltip={<FormattedMessage id="dextintiy.blocks.tipTapRichText.underline.tooltip" defaultMessage="Underline" />}
                            isActive="underline"
                            onToggle={() => editor.chain().focus().toggleUnderline().run()}
                        />
                    )}
                    {supports.includes("strike") && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteStrikethrough}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.strike.tooltip" defaultMessage="Strikethrough" />}
                            isActive="strike"
                            onToggle={() => editor.chain().focus().toggleStrike().run()}
                        />
                    )}
                    {moreOptions && (
                        <>
                            <Tooltip
                                title={<FormattedMessage id="dextinity.blocks.tipTapRichText.moreOptions.tooltip" defaultMessage="More options" />}
                            >
                                <Box
                                    component="button"
                                    type="button"
                                    onMouseDown={(e: MouseEvent) => {
                                        e.preventDefault();
                                        setMoreAnchorEl(e.currentTarget as HTMLElement);
                                    }}
                                    sx={toolbarButtonSx}
                                >
                                    <MoreHorizontal sx={{ fontSize: 15 }} color="inherit" />
                                </Box>
                            </Tooltip>
                            <Menu open={Boolean(moreAnchorEl)} anchorEl={moreAnchorEl} onClose={handleMoreClose}>
                                {supports.includes("sup") && (
                                    <MenuItem
                                        selected={editor.isActive("superscript")}
                                        onMouseDown={(e) => {
                                            handleMoreClose();
                                            e.persist();
                                            setTimeout(() => editor.chain().focus().toggleSuperscript().run(), 0);
                                        }}
                                    >
                                        <FormattedMessage id="dextinity.blocks.tipTapRichText.superscript.label" defaultMessage="Superscript" />
                                        <ListItemIcon sx={{ justifyContent: "flex-end" }}>
                                            <RteSup />
                                        </ListItemIcon>
                                    </MenuItem>
                                )}
                                {supports.includes("sub") && (
                                    <MenuItem
                                        selected={editor.isActive("subscript")}
                                        onMouseDown={(e) => {
                                            handleMoreClose();
                                            e.persist();
                                            setTimeout(() => editor.chain().focus().toggleSubscript().run(), 0);
                                        }}
                                    >
                                        <FormattedMessage id="dextinity.blocks.tipTapRichText.subscript.label" defaultMessage="Subscript" />
                                        <ListItemIcon sx={{ justifyContent: "flex-end" }}>
                                            <RteSub />
                                        </ListItemIcon>
                                    </MenuItem>
                                )}
                            </Menu>
                        </>
                    )}
                </ToolbarGroup>
            )}
            {lists && (
                <ToolbarGroup>
                    {supports.includes("ordered-list") && (
                        <ToolbarButton
                            editor={editor}
                            icon={RteOl}
                            tooltip={<FormattedMessage id="dextinity.blocks.tipTapRichText.orderedList.tooltip" defaultMessage="Ordered list" />}
                            isActive="orderedList"
                            onToggle={() => editor.chain().focus().toggleOrderedList().run()}
                        />
                    )}
                    {supports.includes("unordered-list") && (
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
            {specialChars && (
                <ToolbarGroup>
                    {supports.includes("non-breaking-space") && (
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
                    {supports.includes("soft-hyphen") && (
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
