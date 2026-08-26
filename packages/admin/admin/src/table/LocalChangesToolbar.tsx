import { Toolbar } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { SaveButton } from "../common/buttons/SaveButton";
import { Loading } from "../common/Loading";
import type { ITableLocalChangesApi } from "./TableLocalChanges";

interface Props {
    tableLocalChangesApi: ITableLocalChangesApi;
    localChangesCount: number;
    updateMutation: any;
    loading: boolean;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export const TableLocalChangesToolbar = ({ tableLocalChangesApi, localChangesCount, updateMutation, loading }: Props) => {
    const handleSaveClick = () => {
        tableLocalChangesApi.submitLocalDataChanges();
    };

    return (
        <Toolbar>
            {loading ? (
                <Loading behavior="fillParent" />
            ) : (
                <>
                    <SaveButton onClick={handleSaveClick} />
                    <FormattedMessage
                        values={{ count: localChangesCount }}
                        id="dextinity.table.localChangesToolbar.unsavedItems"
                        defaultMessage="{count, plural, =0 {No unsaved changes} one {# unsaved change} other {# unsaved changes}}"
                    />
                </>
            )}
        </Toolbar>
    );
};
