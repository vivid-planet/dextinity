import { Button, DataGridToolbar, FillSpace } from "@dextinity/admin";
import { ChangeImage } from "@dextinity/admin-icons";
import type { GridToolbarProps } from "@mui/x-data-grid-pro";
import type { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";

export interface ActionGridToolbarProps extends GridToolbarProps {
    disableCompare: boolean;
    onClickCompare: () => void;
}

export const ActionGridToolbar: FunctionComponent<ActionGridToolbarProps> = ({ disableCompare, onClickCompare }) => {
    return (
        <DataGridToolbar>
            <FillSpace />

            <Button disabled={disableCompare} onClick={onClickCompare} startIcon={<ChangeImage />}>
                <FormattedMessage defaultMessage="Compare selected versions" id="actionLog.actionLogVersionGrid.gridToolbar.compareMarkedVersions" />
            </Button>
        </DataGridToolbar>
    );
};
