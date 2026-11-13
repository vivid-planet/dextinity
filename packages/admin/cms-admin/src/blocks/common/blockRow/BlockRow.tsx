import { messages } from "@dextinity/admin";
import { Block, Icon, IconButton, Menu, MenuItem, MenuSeparator } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";

import { useBlockContext } from "../../context/useBlockContext";
import { useHoverPreviewComponent } from "../../iframebridge/useHoverPreviewComponent";
import { type BlockInterface, isPreviewContentImageRule, isPreviewContentTextRule } from "../../types";
import { blockIconName } from "../blockIconName";
import { usePromise } from "../usePromise";
import { useBlockRowLabels } from "./useBlockRowLabels";

export interface BlockRowVisibilityRestriction {
    /** Why the visibility is restricted, e.g. "Max. visible blocks allowed: 3", shown at the toggle. */
    reason: string;
    /** Whether the visibility can still be changed, e.g. to hide a block although the minimum of visible blocks isn't reached. */
    canToggle: boolean;
}

export interface BlockRowMenuApi {
    /** Closes the row's menu. */
    closeMenu: () => void;
    /**
     * Shows a dialog for an action of the menu. The menu closes when an item is chosen, so a dialog rendered inside it would disappear
     * with it; render it through this function instead and call `close` when it's done.
     */
    openDialog: (renderDialog: (close: () => void) => ReactNode) => void;
}

export interface BlockRowProps {
    block: BlockInterface;
    state: unknown;
    /** The route segment of the block in the site preview, relative to the list, e.g. `${key}/blocks`. */
    previewSlug: string;
    /** Replaces the block's name in the summary, e.g. "Column 2". */
    label?: ReactNode;
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    /** Shown instead of the visibility toggle while a limit of visible blocks applies. */
    visibilityRestriction?: BlockRowVisibilityRestriction;
    /** Whether the block is selected for bulk actions. */
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    /** Opens the block's form. */
    onOpen: () => void;
    onCopy: () => void;
    /** Pastes the blocks from the clipboard below this one. */
    onPaste: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    /** Further `MenuItem`s in the row's menu, before Delete. */
    renderAdditionalMenuItems?: (menuApi: BlockRowMenuApi) => ReactNode;
    /** Further content in the row's header, e.g. a chip with the target group. */
    additionalContent?: ReactNode;
}

/**
 * A block in the list of a blocks, list, or columns block, as a `Block` of `@dextinity/ui`: its preview text as title, its type and
 * thumbnail, its visibility, a checkbox for bulk actions, and a menu to copy, paste, duplicate, and delete it. Use it inside a `BlockList`.
 */
export function BlockRow({
    block,
    state,
    previewSlug,
    label,
    visible,
    onVisibleChange,
    visibilityRestriction,
    checked,
    onCheckedChange,
    onOpen,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    renderAdditionalMenuItems,
    additionalContent,
}: BlockRowProps) {
    const intl = useIntl();
    const labels = useBlockRowLabels();
    const context = useBlockContext();
    const { ref, isHovered, onMouseOver, onMouseLeave } = useHoverPreviewComponent<HTMLLIElement>(previewSlug);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [renderDialog, setRenderDialog] = useState<(close: () => void) => ReactNode>();

    const isValidFn = useCallback(() => block.isValid(state), [block, state]);
    const isValid = usePromise(isValidFn, { initialValue: true });

    const previewContent = block.previewContent(state, context);
    const texts = previewContent
        .filter(isPreviewContentTextRule)
        .map(({ content }) => content)
        .filter((content) => content !== "" && content != null);
    const image = previewContent.find(isPreviewContentImageRule);
    const typeName = label ?? block.dynamicDisplayName?.(state) ?? block.displayName;
    const [firstText, secondText] = texts;
    const summary =
        firstText != null ? (
            <>
                {typeName}
                {secondText != null && (
                    <>
                        {" · "}
                        {secondText}
                    </>
                )}
            </>
        ) : undefined;

    const closeMenu = () => setIsMenuOpen(false);
    const menuApi: BlockRowMenuApi = {
        closeMenu,
        openDialog: (nextRenderDialog) => {
            closeMenu();
            setRenderDialog(() => nextRenderDialog);
        },
    };

    const restrictedVisibilityToggle = visibilityRestriction && (
        <IconButton
            variant="text"
            color="secondary"
            size="small"
            aria-label={visibilityRestriction.reason}
            aria-pressed={!visible}
            disabled={!visibilityRestriction.canToggle}
            focusableWhenDisabled
            onClick={() => onVisibleChange(!visible)}
        >
            <Icon name={visible ? "eye" : "eye-off"} />
        </IconButton>
    );

    return (
        <>
            <Block
                ref={ref}
                data-block-key={previewSlug}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
                title={firstText ?? typeName}
                summary={summary}
                icon={image ? <PreviewImage src={image.content.src} alt="" /> : (block.icon?.(state) ?? <Icon name={blockIconName(block)} />)}
                visible={visible}
                onVisibleChange={visibilityRestriction ? undefined : onVisibleChange}
                selected={isHovered}
                onSelect={onOpen}
                invalid={!isValid}
                checked={checked}
                onCheckedChange={onCheckedChange}
                labels={labels.block}
                actions={
                    <>
                        {additionalContent}
                        {restrictedVisibilityToggle}
                        <Menu
                            open={isMenuOpen}
                            onOpenChange={setIsMenuOpen}
                            placement="bottom-end"
                            trigger={
                                <IconButton variant="text" color="secondary" size="small" aria-label={labels.moreActions}>
                                    <Icon name="more-vertical" />
                                </IconButton>
                            }
                        >
                            <MenuItem label={intl.formatMessage(messages.copy)} icon={<Icon name="copy" />} onClick={onCopy} />
                            <MenuItem label={labels.pasteBelow} icon={<Icon name="paste-add" />} onClick={onPaste} />
                            <MenuItem label={labels.duplicate} icon={<Icon name="duplicate" />} onClick={onDuplicate} />
                            {renderAdditionalMenuItems?.(menuApi)}
                            <MenuSeparator />
                            <MenuItem label={intl.formatMessage(messages.delete)} icon={<Icon name="trash" />} color="error" onClick={onDelete} />
                        </Menu>
                    </>
                }
            />
            {renderDialog?.(() => setRenderDialog(undefined))}
        </>
    );
}

const PreviewImage = styled("img")`
    inline-size: 100%;
    block-size: 100%;
    border-radius: inherit;
    object-fit: cover;
`;
