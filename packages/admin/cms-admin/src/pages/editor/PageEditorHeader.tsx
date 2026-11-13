import { messages } from "@dextinity/admin";
import {
    Button,
    formatShortcut,
    Icon,
    IconButton,
    isApplePlatform,
    Menu,
    PageHeader,
    type PageHeaderBack,
    SaveState,
    type SaveStateValue,
    Skeleton,
    StatusIndicator,
    Tooltip,
} from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { Children, type MouseEvent, type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import { usePageTreeStatusLabels, visibilityStatus } from "../treeDetail/pageTreeStatus";

export interface PageEditorHeaderProps {
    /** The page's name. A placeholder shows while it loads. */
    title?: string;
    back?: PageHeaderBack;
    /** Called when the back link is clicked, e.g. to navigate with the router while keeping modifier clicks. */
    onBackClick?: (event: MouseEvent<HTMLElement>) => void;
    /** The kind of document and the scope, e.g. "Page · Main / English". */
    eyebrow?: ReactNode;
    visibility?: GQLPageTreeNodeVisibility;
    path?: string;
    saveState: SaveStateValue;
    savedAt?: Date;
    hasChanges: boolean;
    saving: boolean;
    saveError?: "invalid" | "conflict" | "error";
    onSave: () => void;
    /** The entries of the "More actions" menu, `MenuItem`s of `@dextinity/ui`. Without entries, the menu isn't shown. */
    menuItems?: ReactNode;
}

/**
 * The compact header of a page editor: back to the page tree, kind and scope, the page's name with its status and path, and the save state
 * next to "More actions" and "Save", the only primary action.
 */
export function PageEditorHeader({
    title,
    back,
    onBackClick,
    eyebrow,
    visibility,
    path,
    saveState,
    savedAt,
    hasChanges,
    saving,
    saveError,
    onSave,
    menuItems,
}: PageEditorHeaderProps) {
    const intl = useIntl();
    const statusLabels = usePageTreeStatusLabels();
    const [menuOpen, setMenuOpen] = useState(false);
    const hasMenuItems = Children.toArray(menuItems).length > 0;

    const saveErrorMessage =
        saveError === "invalid"
            ? intl.formatMessage(messages.invalidData)
            : saveError === "conflict"
              ? intl.formatMessage(messages.saveConflict)
              : saveError === "error"
                ? intl.formatMessage(messages.error)
                : undefined;
    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");

    return (
        <PageHeader
            variant="compact"
            back={back}
            slotProps={onBackClick ? { back: { onClick: onBackClick } } : undefined}
            eyebrow={eyebrow}
            title={title ?? intl.formatMessage({ id: "dextinity.pageEditor.loading", defaultMessage: "Loading page …" })}
            subtitle={
                visibility != null || path != null ? (
                    <MetaLine>
                        {visibility != null && <StatusIndicator status={visibilityStatus[visibility]} labels={statusLabels} />}
                        {path != null && <Path>{path}</Path>}
                    </MetaLine>
                ) : (
                    <Skeleton width={160} />
                )
            }
            actions={
                <>
                    <SaveState
                        state={saveState}
                        savedAt={savedAt}
                        locale={intl.locale}
                        labels={{
                            saved: intl.formatMessage({ id: "dextinity.pageEditor.saveState.saved", defaultMessage: "All changes saved" }),
                            dirty: intl.formatMessage({ id: "dextinity.pageEditor.saveState.dirty", defaultMessage: "Unsaved changes" }),
                            saving: intl.formatMessage({ id: "dextinity.pageEditor.saveState.saving", defaultMessage: "Saving …" }),
                            error:
                                saveErrorMessage ?? intl.formatMessage({ id: "dextinity.pageEditor.saveState.error", defaultMessage: "Not saved" }),
                            savedAt: intl.formatMessage({ id: "dextinity.pageEditor.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                        }}
                    />
                    {hasMenuItems && (
                        <Menu
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                            placement="bottom-end"
                            trigger={
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    aria-label={intl.formatMessage({ id: "dextinity.pageEditor.moreActions", defaultMessage: "More actions" })}
                                >
                                    <Icon name="more-horizontal" />
                                </IconButton>
                            }
                        >
                            {menuItems}
                        </Menu>
                    )}
                    <Tooltip
                        content={saveErrorMessage ?? intl.formatMessage({ id: "dextinity.pageEditor.saveTooltip", defaultMessage: "Saves the page" })}
                        shortcut={saveErrorMessage == null ? saveShortcut : undefined}
                    >
                        <Button
                            color={saveErrorMessage != null ? "error" : "primary"}
                            startIcon={<Icon name={saveErrorMessage != null ? "alert" : "check"} />}
                            disabled={!hasChanges}
                            loading={saving}
                            onClick={onSave}
                        >
                            {intl.formatMessage(messages.save)}
                        </Button>
                    </Tooltip>
                </>
            }
        />
    );
}

const MetaLine = styled("span")`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--dextinity-space-3);
`;

const Path = styled("span")`
    font-family: var(--dextinity-font-family-mono);
    overflow-wrap: anywhere;
`;
