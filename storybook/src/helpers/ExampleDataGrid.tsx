import type { GridColDef } from "@dextinity/admin";

export const exampleRows = [
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

export const exampleColumns: GridColDef[] = [
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
