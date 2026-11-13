import { Icon, IconButton, Menu, MenuItem, MenuSeparator, MenuSubmenu } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import { pageTreeShortcuts } from "./pageTreeShortcuts";
import type { PastePosition } from "./usePageTreeCopyPaste";
import { canChangeVisibility } from "./usePageTreeDetailActions";

export interface PageTreeNodeMenuCategory {
    category: string;
    label: string;
    disabledReason?: string;
}

interface PageTreeNodeMenuProps {
    page: GQLPageTreePageFragment;
    onPropertiesClick: () => void;
    onAddSubpageClick: () => void;
    onVisibilityChange: (visibility: GQLPageTreeNodeVisibility) => void;
    onCopyClick: () => void;
    onPasteClick: (position: PastePosition) => void;
    /** Reads the clipboard when the menu opens, so paste is offered only when there are pages to paste. */
    onOpen: () => void;
    hasClipboardPages: boolean;
    onDuplicateClick: () => void;
    /** The other categories the page can be moved to. Without them, "Move to" isn't shown. */
    categories: PageTreeNodeMenuCategory[];
    onMoveToCategoryClick: (category: string) => void;
    /** Without it, translating isn't offered, e.g. when no translation service is configured. */
    translate?: { disabledReason?: string; onClick: () => void };
    /** Without it, deleting isn't offered. */
    delete?: { disabledReason?: string; onClick: () => void };
}

export function PageTreeNodeMenu({
    page,
    onPropertiesClick,
    onAddSubpageClick,
    onVisibilityChange,
    onCopyClick,
    onPasteClick,
    onOpen,
    hasClipboardPages,
    onDuplicateClick,
    categories,
    onMoveToCategoryClick,
    translate,
    delete: deleteAction,
}: PageTreeNodeMenuProps) {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [isMoveSubmenuOpen, setIsMoveSubmenuOpen] = useState(false);
    const isArchived = page.visibility === "Archived";
    const emptyClipboardReason = intl.formatMessage({
        id: "dextinity.pageTreeDetail.detail.emptyClipboard",
        defaultMessage: "Copy pages first, also in another scope",
    });

    return (
        <Menu
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) {
                    onOpen();
                } else {
                    setIsMoveSubmenuOpen(false);
                }
            }}
            placement="bottom-end"
            trigger={
                <IconButton
                    variant="text"
                    color="secondary"
                    aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.moreActions", defaultMessage: "More actions" })}
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem
                icon={<Icon name="gear" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.properties", defaultMessage: "Page properties" })}
                disabled={isArchived}
                onClick={onPropertiesClick}
            />
            <MenuItem
                icon={<Icon name="plus" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.addSubpage", defaultMessage: "New subpage" })}
                disabled={isArchived}
                onClick={onAddSubpageClick}
            />
            <MenuSeparator />
            <MenuItem
                icon={<Icon name="copy" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.copy", defaultMessage: "Copy with subpages" })}
                shortcut={pageTreeShortcuts.copy}
                onClick={onCopyClick}
            />
            <MenuItem
                icon={<Icon name="paste-add" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.pasteAfter", defaultMessage: "Paste after" })}
                shortcut={pageTreeShortcuts.pasteAfter}
                disabled={!hasClipboardPages}
                disabledReason={emptyClipboardReason}
                onClick={() => onPasteClick("after")}
            />
            <MenuItem
                icon={<Icon name="paste-add" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.pasteInside", defaultMessage: "Paste as subpage" })}
                shortcut={pageTreeShortcuts.pasteInside}
                disabled={!hasClipboardPages || isArchived}
                disabledReason={isArchived ? undefined : emptyClipboardReason}
                onClick={() => onPasteClick("inside")}
            />
            <MenuItem
                icon={<Icon name="duplicate" />}
                label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.duplicate", defaultMessage: "Duplicate" })}
                onClick={onDuplicateClick}
            />
            {categories.length > 0 && (
                <MenuSubmenu
                    icon={<Icon name="page-move" />}
                    label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.moveToCategory", defaultMessage: "Move to" })}
                    open={isMoveSubmenuOpen}
                    onOpenChange={setIsMoveSubmenuOpen}
                    disabled={isArchived}
                >
                    {categories.map(({ category, label, disabledReason }) => (
                        <MenuItem
                            key={category}
                            label={label}
                            disabled={disabledReason != null}
                            disabledReason={disabledReason}
                            onClick={() => onMoveToCategoryClick(category)}
                        />
                    ))}
                </MenuSubmenu>
            )}
            {translate != null && (
                <MenuItem
                    icon={<Icon name="translate" />}
                    label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.translate", defaultMessage: "Translate" })}
                    disabled={translate.disabledReason != null || isArchived}
                    disabledReason={isArchived ? undefined : translate.disabledReason}
                    onClick={translate.onClick}
                />
            )}
            <MenuSeparator />
            {isArchived ? (
                <MenuItem
                    icon={<Icon name="refresh" />}
                    label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.restore", defaultMessage: "Restore as unpublished" })}
                    onClick={() => onVisibilityChange("Unpublished")}
                />
            ) : (
                <MenuItem
                    icon={<Icon name="archive" />}
                    label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.archive", defaultMessage: "Archive with subpages" })}
                    disabled={!canChangeVisibility(page, "Archived")}
                    onClick={() => onVisibilityChange("Archived")}
                />
            )}
            {deleteAction != null && (
                <MenuItem
                    icon={<Icon name="trash" />}
                    label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.delete", defaultMessage: "Delete with subpages" })}
                    color="error"
                    disabled={deleteAction.disabledReason != null}
                    disabledReason={deleteAction.disabledReason}
                    onClick={deleteAction.onClick}
                />
            )}
        </Menu>
    );
}
