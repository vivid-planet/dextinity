import { type PureQueryOptions, useApolloClient } from "@apollo/client";
// eslint-disable-next-line no-restricted-imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { Fragment, type ReactNode, useContext, useState } from "react";
import { FormattedMessage } from "react-intl";

import { CancelButton } from "./common/buttons/cancel/CancelButton";
import { DeleteButton } from "./common/buttons/delete/DeleteButton";
import { TableQueryContext } from "./table/TableQueryContext";

interface IProps {
    mutation: any;
    children: (action: (options: { variables: object }) => void, data: { loading: boolean; error: any }) => ReactNode;
    refetchQueries?: Array<string | PureQueryOptions>;
}
export function DeleteMutation(props: IProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVariables, setPendingVariables] = useState<object | undefined>(undefined);
    const client = useApolloClient();
    const tableQuery = useContext(TableQueryContext);
    const { refetchQueries = [] } = props;

    return (
        <Fragment>
            {props.children(
                (options) => {
                    setDialogOpen(true);
                    setPendingVariables(options.variables);
                },
                {
                    loading,
                    error: null, // TODO
                },
            )}

            <Dialog open={dialogOpen} onClose={handleNoClick} maxWidth="xs">
                <DialogTitle>
                    <FormattedMessage
                        id="dextinity.deleteMutation.promptDelete"
                        defaultMessage="Delete item?"
                        description="Prompt to delete an item"
                    />
                </DialogTitle>
                <DialogActions>
                    <CancelButton onClick={handleNoClick} />
                    <DeleteButton onClick={handleYesClick} autoFocus />
                </DialogActions>
            </Dialog>
        </Fragment>
    );

    function handleYesClick() {
        setDialogOpen(false);
        setLoading(true);
        if (tableQuery) {
            refetchQueries.push({
                query: tableQuery.api.getQuery(),
                variables: tableQuery.api.getVariables(),
            });
        }
        client
            .mutate({
                mutation: props.mutation,
                variables: pendingVariables,
                refetchQueries,
            })
            .then(() => {
                setLoading(false);
                if (pendingVariables) {
                    if (tableQuery) {
                        tableQuery.api.onRowDeleted();
                    }
                }
            });
    }

    function handleNoClick() {
        setDialogOpen(false);
    }
}
