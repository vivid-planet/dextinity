import { Edit } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { ToolbarBackButton } from "../../common/toolbar/backbutton/ToolbarBackButton";
import { ToolbarTitleItem } from "../../common/toolbar/titleitem/ToolbarTitleItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { StackPage } from "../../stack/Page";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch, useStackSwitchApi } from "../../stack/Switch";
import type { GridColDef } from "../GridColDef";

const exampleRows = [
    { id: 1, lastName: "Snow", firstName: "Jon" },
    { id: 2, lastName: "Lannister", firstName: "Cersei" },
    { id: 3, lastName: "Lannister", firstName: "Jaime" },
    { id: 4, lastName: "Stark", firstName: "Arya" },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys" },
    { id: 6, lastName: "Melisandre", firstName: null },
    { id: 7, lastName: "Clifford", firstName: "Ferrara" },
    { id: 8, lastName: "Frances", firstName: "Rossini" },
    { id: 9, lastName: "Roxie", firstName: "Harvey" },
];

const exampleColumns: GridColDef[] = [
    {
        field: "firstName",
        headerName: "First name",
        flex: 1,
    },
    {
        field: "lastName",
        headerName: "Last name",
        flex: 1,
    },
];

export default {
    title: "components/dataGrid/ClickableRows",
    parameters: {
        stack: { topLevelTitle: "Example Page" },
    },
};

export const ClickableRows = () => {
    // Grid must be a separate component to make sure the stackSwitchApi context is correct
    const Grid = () => {
        const stackSwitchApi = useStackSwitchApi();

        const columns: GridColDef[] = [
            ...exampleColumns,
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 52,
                renderCell: (params) => (
                    <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                        <Edit />
                    </IconButton>
                ),
            },
        ];

        return (
            <DataGrid
                rows={exampleRows}
                columns={columns}
                onRowClick={(params) => {
                    stackSwitchApi.activatePage("edit", params.row.id);
                }}
            />
        );
    };

    return (
        <StackSwitch>
            <StackPage name="grid">
                <Grid />
            </StackPage>
            <StackPage name="edit">
                {(id) => (
                    <Toolbar>
                        <ToolbarBackButton />
                        <ToolbarTitleItem>
                            Editing item with id: <code>{id}</code>
                        </ToolbarTitleItem>
                    </Toolbar>
                )}
            </StackPage>
        </StackSwitch>
    );
};
