import { Dialog, StackLink, SubRoute } from "@dextinity/admin";
import { styled } from "@mui/material/styles";
import type { ReactNode, SyntheticEvent } from "react";
import { MemoryRouter } from "react-router";

import { useDamConfig } from "../../../dam/config/damConfig";
import { DamScopeProvider } from "../../../dam/config/DamScopeProvider";
import { useDamScope } from "../../../dam/config/useDamScope";
import { DamTable } from "../../../dam/DamTable";
import type { GQLDamFileTableFragment } from "../../../dam/DataGrid/FolderDataGrid";
import DamItemLabel from "../../../dam/DataGrid/label/DamItemLabel";
import type { RenderDamLabelOptions } from "../../../dam/DataGrid/label/DamItemLabelColumn";
import { isFile } from "../../../dam/helpers/isFile";
import { RedirectToPersistedDamLocation } from "./RedirectToPersistedDamLocation";

const FolderStackLink = styled(StackLink)`
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: ${({ theme }) => theme.palette.grey[900]};
`;

interface BaseChooseDamFileDialogProps {
    open: boolean;
    onClose: (event: SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => void;
    title: ReactNode;
    stateKey: string;
    allowedMimetypes?: string[];
    renderFileLabel: (file: GQLDamFileTableFragment, options: RenderDamLabelOptions) => ReactNode;
    hideMultiselect: boolean;
    disableFolderSelection?: boolean;
    keepNonExistentRowsSelected?: boolean;
    initialFileIds?: string[];
    onFileIdsChange?: (ids: string[]) => void;
    actions?: ReactNode;
}

export const BaseChooseDamFileDialog = ({
    open,
    onClose,
    title,
    stateKey,
    allowedMimetypes,
    renderFileLabel,
    hideMultiselect,
    disableFolderSelection,
    keepNonExistentRowsSelected,
    initialFileIds,
    onFileIdsChange,
    actions,
}: BaseChooseDamFileDialogProps) => {
    const { enableLicenseFeature, additionalToolbarItems } = useDamConfig();
    const scope = useDamScope();

    const scopedStateKey = Object.keys(scope).length > 0 ? `${Object.values(scope).join("-")}-${stateKey}` : stateKey;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            title={title}
            slotProps={{
                root: {
                    PaperProps: {
                        sx: { height: "100%" }, // The fixed height prevents the height of the dialog from changing when navigating between folders which may have different heights depending on the number of items in the folder
                    },
                },
            }}
        >
            <DamScopeProvider>
                <MemoryRouter>
                    <SubRoute path="">
                        <RedirectToPersistedDamLocation stateKey={scopedStateKey} />
                        <DamTable
                            renderDamLabel={(row, options) => {
                                if (isFile(row)) {
                                    return renderFileLabel(row, { ...options, showLicenseWarnings: enableLicenseFeature });
                                }
                                return (
                                    <FolderStackLink
                                        pageName="folder"
                                        payload={row.id}
                                        onClick={() => {
                                            options.filterApi.formApi.change("searchText", undefined);
                                        }}
                                    >
                                        <DamItemLabel asset={row} matches={options.matches} />
                                    </FolderStackLink>
                                );
                            }}
                            allowedMimetypes={allowedMimetypes}
                            hideContextMenu={true}
                            hideMultiselect={hideMultiselect}
                            hideArchiveFilter={true}
                            toolbarOptions={{ hideSelectiveActions: true }}
                            disableFolderSelection={disableFolderSelection}
                            keepNonExistentRowsSelected={keepNonExistentRowsSelected}
                            initialSelection={initialFileIds ? new Map(initialFileIds.map((id) => [id, "file"])) : undefined}
                            onSelectionChange={onFileIdsChange ? (map) => onFileIdsChange(Array.from(map.keys())) : undefined}
                            additionalToolbarItems={additionalToolbarItems}
                        />
                    </SubRoute>
                </MemoryRouter>
            </DamScopeProvider>
            {actions}
        </Dialog>
    );
};
