import { Add as AddIcon } from "@dextinity/admin-icons";
import { DataGrid as DataGridCommunity } from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";

import { GridColumnsButton } from "../../../dataGrid/GridColumnsButton";
import { GridFilterButton } from "../../../dataGrid/GridFilterButton";
import { GridToolbarQuickFilter } from "../../../dataGrid/GridToolbarQuickFilter";
import { useDataGridRemote } from "../../../dataGrid/useDataGridRemote";
import { usePersistentColumnState } from "../../../dataGrid/usePersistentColumnState";
import { StackLink } from "../../../stack/StackLink";
import { Button } from "../../buttons/Button";
import { FillSpace } from "../../FillSpace";
import { DataGridToolbar } from "../DataGridToolbar";

const data = [
    { id: "1f30a6a0-5b9d-4b25-8307-9e8b4a4d2b1c", firstname: "Emily", lastname: "Smith" },
    { id: "28b9bdf3-5646-4a22-9449-74112db67b5f", firstname: "Daniel", lastname: "Johnson" },
    { id: "e60900ec-3c69-4e67-8d78-83a10c7573d3", firstname: "Sophia", lastname: "Williams" },
];

const gridOptions = ["Community", "Pro"] as const;

export default {
    title: "components/toolbar/DataGridToolbar",
    argTypes: {
        gridVersion: {
            name: "Data Grid Version",
            control: "select",
            options: gridOptions,
        },
    },
    args: { gridVersion: gridOptions[0] },
};

export const _DataGridToolbar = {
    render: ({ gridVersion }: { gridVersion: (typeof gridOptions)[number] }) => {
        const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("FooBar") };

        const columns = [
            { field: "firstname", headerName: "First Name", width: 150 },
            { field: "lastname", headerName: "Last Name", width: 150 },
        ];

        const ToolbarSlot = () => {
            return (
                <DataGridToolbar>
                    <GridToolbarQuickFilter />
                    <GridFilterButton />
                    <GridColumnsButton />
                    <FillSpace />
                    <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                        Add person
                    </Button>
                </DataGridToolbar>
            );
        };

        const DataGrid = gridVersion === "Community" ? DataGridCommunity : DataGridPro;

        return (
            <DataGrid
                {...dataGridProps}
                autoHeight
                columns={columns}
                rows={data}
                slots={{
                    toolbar: ToolbarSlot,
                }}
                showToolbar
            />
        );
    },

    name: "DataGrid Toolbar",
};
