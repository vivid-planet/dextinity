import { Add } from "@dextinity/admin-icons";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { Button } from "../../common/buttons/Button";
import { FillSpace } from "../../common/FillSpace";
import { DataGridToolbar } from "../../common/toolbar/DataGridToolbar";
import { ToolbarTitleItem } from "../../common/toolbar/titleitem/ToolbarTitleItem";
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
    title: "components/dataGrid/DataGrid",
};

type DefaultArgs = {
    density: "standard" | "comfortable" | "compact";
};

export const Default = {
    args: {
        density: "standard",
    },
    argTypes: {
        density: {
            name: "Density",
            control: "select",
            options: ["standard", "comfortable", "compact"],
        },
    },
    render: ({ density }: DefaultArgs) => {
        const ToolbarForGrid = () => {
            return (
                <DataGridToolbar>
                    <ToolbarTitleItem>DataGrid example</ToolbarTitleItem>
                    <FillSpace />
                    <Button startIcon={<Add />}>Add</Button>
                </DataGridToolbar>
            );
        };

        return (
            <Box height={400}>
                <DataGrid
                    density={density}
                    rows={exampleRows}
                    columns={exampleColumns}
                    slots={{
                        toolbar: ToolbarForGrid,
                    }}
                    showToolbar
                />
            </Box>
        );
    },
};
