import { GridCellContent, type GridColDef } from "@dextinity/admin";
import { StateFilled } from "@dextinity/admin-icons";
import { faker } from "@faker-js/faker";
import { DataGrid } from "@mui/x-data-grid";

export default {
    title: "Docs/Components/GridCellContent",
};

export const Basic = {
    render: () => {
        const gridRows = Array.from({ length: 5 }).map((_, index) => ({
            id: index + 1,
            name: faker.person.fullName(),
            occupation: faker.person.jobTitle(),
            email: faker.internet.email(),
            onlineStatus: faker.datatype.boolean(),
        }));

        const gridColumns: GridColDef[] = [
            {
                field: "person",
                headerName: "Person",
                flex: 1,
                renderCell: ({ row }) => <GridCellContent primaryText={row.name} secondaryText={row.occupation} />,
            },
            {
                field: "company",
                headerName: "Company",
                flex: 1,
            },
            {
                field: "email",
                headerName: "Email",
                flex: 1,
            },
            {
                field: "onlineStatus",
                headerName: "Status",
                flex: 1,
                renderCell: ({ row }) => (
                    <GridCellContent
                        icon={<StateFilled color={row.onlineStatus ? "success" : "disabled"} />}
                        primaryText={row.onlineStatus ? "Online" : "Offline"}
                    />
                ),
            },
        ];

        return <DataGrid autoHeight rows={gridRows} columns={gridColumns} />;
    },
    name: "GridCellContent",
};
