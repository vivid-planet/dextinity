import { Icon, IconButton, Menu, MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import { type DamFinderLicenseStatus, formatDamFinderLicenseStatus } from "./damFinderItems";

export type DamFinderLicenseFilter = "all" | DamFinderLicenseStatus;

const licenseStatuses: DamFinderLicenseStatus[] = ["expired", "expiresSoon", "notValidYet"];

interface DamFinderFilterMenuProps {
    showArchived: boolean;
    onShowArchivedChange: (showArchived: boolean) => void;
    /** The license filter; without it, the license options are hidden. */
    licenseFilter?: DamFinderLicenseFilter;
    onLicenseFilterChange: (licenseFilter: DamFinderLicenseFilter) => void;
}

export function DamFinderFilterMenu({ showArchived, onShowArchivedChange, licenseFilter, onLicenseFilterChange }: DamFinderFilterMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const activeFilterCount = (showArchived ? 1 : 0) + (licenseFilter != null && licenseFilter !== "all" ? 1 : 0);
    const label = intl.formatMessage({ id: "dextinity.damFinder.filter", defaultMessage: "Filter" });

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    size="small"
                    variant={activeFilterCount > 0 ? "contained" : "outlined"}
                    color={activeFilterCount > 0 ? "primary" : "secondary"}
                    aria-label={
                        activeFilterCount > 0
                            ? intl.formatMessage(
                                  {
                                      id: "dextinity.damFinder.filterActive",
                                      defaultMessage: "{label}, {count, plural, one {# filter} other {# filters}} active",
                                  },
                                  { label, count: activeFilterCount },
                              )
                            : label
                    }
                >
                    <Icon name="filter" />
                </IconButton>
            }
        >
            <MenuCheckboxItem
                label={intl.formatMessage({ id: "dextinity.damFinder.filter.showArchived", defaultMessage: "Show archived files" })}
                icon={<Icon name="archive" />}
                checked={showArchived}
                onChange={onShowArchivedChange}
            />
            {licenseFilter != null && (
                <>
                    <MenuSeparator />
                    <MenuGroup label={intl.formatMessage({ id: "dextinity.damFinder.filter.license", defaultMessage: "License" })}>
                        <MenuRadioGroup value={licenseFilter} onChange={(value) => onLicenseFilterChange(value as DamFinderLicenseFilter)}>
                            <MenuRadioItem
                                value="all"
                                label={intl.formatMessage({ id: "dextinity.damFinder.filter.license.all", defaultMessage: "All files" })}
                            />
                            {licenseStatuses.map((status) => (
                                <MenuRadioItem key={status} value={status} label={formatDamFinderLicenseStatus(intl, status)} />
                            ))}
                        </MenuRadioGroup>
                    </MenuGroup>
                </>
            )}
        </Menu>
    );
}

interface DamFinderSelectionMenuProps {
    fileCount: number;
    folderCount: number;
    archivedFileCount: number;
    onMove: () => void;
    onDownload: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void;
}

/** The actions for the selected files and folders. */
export function DamFinderSelectionMenu({
    fileCount,
    folderCount,
    archivedFileCount,
    onMove,
    onDownload,
    onArchive,
    onRestore,
    onDelete,
}: DamFinderSelectionMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const count = fileCount + folderCount;
    const isSingleFolder = fileCount === 0 && folderCount === 1;

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            disabled={count === 0}
            trigger={
                <IconButton
                    size="small"
                    variant="outlined"
                    color="secondary"
                    aria-label={intl.formatMessage({ id: "dextinity.damFinder.actions", defaultMessage: "Actions for the selection" })}
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.damFinder.actions.move", defaultMessage: "Move to…" })}
                icon={<Icon name="move" />}
                onClick={onMove}
            />
            <MenuItem
                label={
                    isSingleFolder
                        ? intl.formatMessage({ id: "dextinity.damFinder.actions.downloadFolder", defaultMessage: "Download as ZIP" })
                        : intl.formatMessage({ id: "dextinity.damFinder.actions.download", defaultMessage: "Download" })
                }
                icon={<Icon name={isSingleFolder ? "zip-file" : "download"} />}
                disabled={fileCount === 0 && !isSingleFolder}
                disabledReason={intl.formatMessage({
                    id: "dextinity.damFinder.actions.downloadFoldersDisabled",
                    defaultMessage: "Only one folder at a time can be downloaded, and not together with files",
                })}
                onClick={onDownload}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.damFinder.actions.archive", defaultMessage: "Archive" })}
                icon={<Icon name="archive" />}
                disabled={fileCount - archivedFileCount === 0}
                disabledReason={intl.formatMessage({
                    id: "dextinity.damFinder.actions.archiveDisabled",
                    defaultMessage: "Only files that aren't archived can be archived",
                })}
                onClick={onArchive}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.damFinder.actions.restore", defaultMessage: "Restore" })}
                icon={<Icon name="restore" />}
                disabled={archivedFileCount === 0}
                disabledReason={intl.formatMessage({
                    id: "dextinity.damFinder.actions.restoreDisabled",
                    defaultMessage: "Only archived files can be restored",
                })}
                onClick={onRestore}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.damFinder.actions.delete", defaultMessage: "Delete…" })}
                icon={<Icon name="delete" />}
                color="error"
                onClick={onDelete}
            />
        </Menu>
    );
}
