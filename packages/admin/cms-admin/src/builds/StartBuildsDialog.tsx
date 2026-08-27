import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Button, CancelButton, LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    CircularProgress,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import type { GridRowSelectionModel } from "@mui/x-data-grid";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import type { GQLBuildTemplatesQuery, GQLCreateBuildsMutation, GQLCreateBuildsMutationVariables } from "./StartBuildsDialog.generated";

const buildTemplatesQuery = gql`
    query BuildTemplates {
        buildTemplates {
            id
            name
            label
        }
    }
`;

const createBuildsMutation = gql`
    mutation CreateBuilds($input: CreateBuildsInput!) {
        createBuilds(input: $input)
    }
`;

type StartBuildsDialogProps = {
    open: boolean;
    onClose: () => void;
};

export function StartBuildsDialog(props: StartBuildsDialogProps) {
    const { open, onClose } = props;

    const intl = useIntl();

    const { data } = useQuery<GQLBuildTemplatesQuery>(buildTemplatesQuery, {
        context: LocalErrorScopeApolloContext,
    });
    const [startBuilds, { loading }] = useMutation<GQLCreateBuildsMutation, GQLCreateBuildsMutationVariables>(createBuildsMutation, {
        refetchQueries: ["Builds"],
    });

    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
        type: "include",
        ids: new Set([]),
    });

    const rows = data?.buildTemplates ?? [];

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <FormattedMessage id="dextinity.pages.publisher.startBuildsDialog.header" defaultMessage="Start manual builds" />
            </DialogTitle>
            <DialogContent>
                <Alert severity="info">
                    <FormattedMessage
                        id="dextinity.pages.publisher.startBuildsDialog.hint"
                        defaultMessage="Please use this function only in exceptional cases. The more builds you start, the longer it takes until they are completed. If you need to rebuild manually, select only the scopes required."
                    />
                </Alert>
                <DataGrid
                    autoHeight
                    rows={rows}
                    columns={[
                        {
                            field: "name",
                            headerName: intl.formatMessage({
                                id: "dextinity.pages.publisher.startBuildsDialog.buildTemplates.name",
                                defaultMessage: "Name",
                            }),
                            flex: 1,
                            renderCell: ({ row }) => {
                                return row.label && row.label.length > 0 ? row.label : row.name;
                            },
                        },
                    ]}
                    checkboxSelection
                    disableColumnSelector
                    onRowSelectionModelChange={(newSelectionModel) => {
                        setSelectionModel(newSelectionModel);
                    }}
                    disableRowSelectionExcludeModel
                    rowSelectionModel={selectionModel}
                    hideFooter
                />
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={() => onClose()} />
                <Button
                    disabled={loading || selectionModel.ids.size < 1}
                    startIcon={loading ? <CircularProgress size={20} /> : undefined}
                    onClick={async () => {
                        await startBuilds({
                            variables: { input: { names: rows.filter((row) => selectionModel.ids.has(row.id)).map((row) => row.name) } },
                        });
                        onClose();
                    }}
                >
                    <FormattedMessage id="dextinity.pages.publisher.startBuildsDialog.button" defaultMessage="Start builds" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
