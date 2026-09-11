import { Check, Close, Education } from "@dextinity/admin-icons";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { DataGridToolbar } from "../../common/toolbar/DataGridToolbar";
import { GridCellContent } from "../GridCellContent";
import type { GridColDef } from "../GridColDef";
import { GridFilterButton } from "../GridFilterButton";

export default {
    title: "components/dataGrid/DataGridSingleSelectFilter",
};

// Sample data
const rows = [
    { id: 1, name: "Product A", category: "electronics", status: "active", priority: "high", department: "sales" },
    { id: 2, name: "Product B", category: "clothing", status: "inactive", priority: "medium", department: "marketing" },
    { id: 3, name: "Product C", category: "electronics", status: "active", priority: "low", department: "sales" },
    { id: 4, name: "Product D", category: "furniture", status: "pending", priority: "high", department: "operations" },
    { id: 5, name: "Product E", category: "clothing", status: "active", priority: "medium", department: "sales" },
    { id: 6, name: "Product F", category: "electronics", status: "inactive", priority: "low", department: "marketing" },
    { id: 7, name: "Product G", category: "furniture", status: "active", priority: "high", department: "operations" },
    { id: 8, name: "Product H", category: "clothing", status: "pending", priority: "medium", department: "sales" },
];

// Story 1: Basic single select with simple string options
export const BasicSingleSelect = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "category",
                headerName: "Category",
                width: 150,
                type: "singleSelect",
                valueOptions: ["electronics", "clothing", "furniture"],
            },
            {
                field: "status",
                headerName: "Status",
                width: 130,
                type: "singleSelect",
                valueOptions: ["active", "inactive", "pending"],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    Basic SingleSelect Filter
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        initialState={{
                            filter: {
                                filterModel: {
                                    items: [],
                                },
                            },
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 2: Single select with custom labels
export const WithCustomLabels = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "priority",
                headerName: "Priority",
                width: 150,
                type: "singleSelect",
                valueOptions: [
                    { value: "high", label: "🔴 High Priority" },
                    { value: "medium", label: "🟡 Medium Priority" },
                    { value: "low", label: "🟢 Low Priority" },
                ],
            },
            {
                field: "department",
                headerName: "Department",
                width: 150,
                type: "singleSelect",
                valueOptions: [
                    { value: "sales", label: "💼 Sales Department" },
                    { value: "marketing", label: "📢 Marketing Department" },
                    { value: "operations", label: "⚙️ Operations Department" },
                ],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    SingleSelect with Custom Labels
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 3: Single select with long labels (showcases vertical expansion)
export const WithLongLabels = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "category",
                headerName: "Category",
                width: 200,
                type: "singleSelect",
                valueOptions: [
                    {
                        value: "electronics",
                        label: "Electronics and Computer Equipment with Accessories",
                    },
                    {
                        value: "clothing",
                        label: "Clothing, Apparel, and Fashion Items for All Seasons",
                    },
                    {
                        value: "furniture",
                        label: "Furniture, Home Decor, and Interior Design Products",
                    },
                ],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    SingleSelect with Long Labels
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 4: Single select with many options
export const WithManyOptions = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "category",
                headerName: "Category (Many Options)",
                width: 200,
                type: "singleSelect",
                valueOptions: [
                    "electronics",
                    "clothing",
                    "furniture",
                    "books",
                    "toys",
                    "sports",
                    "automotive",
                    "food",
                    "health",
                    "beauty",
                    "tools",
                    "garden",
                    "pet supplies",
                    "office supplies",
                    "musical instruments",
                ],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    SingleSelect with Many Options
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 5: Single select with custom cell content
export const WithCustomCellContent = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "status",
                headerName: "Status with Icon",
                width: 200,
                type: "singleSelect",
                valueOptions: [
                    {
                        value: "active",
                        label: "Active Status",
                        cellContent: <GridCellContent primaryText="Active" icon={<Check color="success" />} />,
                    },
                    {
                        value: "inactive",
                        label: "Inactive Status",
                        cellContent: <GridCellContent primaryText="Inactive" icon={<Close color="error" />} />,
                    },
                    {
                        value: "pending",
                        label: "Pending Review",
                        cellContent: <GridCellContent primaryText="Pending" icon={<Education color="warning" />} />,
                    },
                ],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    SingleSelect with Custom Cell Content
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 6: Multiple single select columns
export const MultipleSingleSelectColumns = {
    render: () => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "category",
                headerName: "Category",
                width: 140,
                type: "singleSelect",
                valueOptions: ["electronics", "clothing", "furniture"],
            },
            {
                field: "status",
                headerName: "Status",
                width: 130,
                type: "singleSelect",
                valueOptions: ["active", "inactive", "pending"],
            },
            {
                field: "priority",
                headerName: "Priority",
                width: 130,
                type: "singleSelect",
                valueOptions: [
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                ],
            },
            {
                field: "department",
                headerName: "Department",
                width: 150,
                type: "singleSelect",
                valueOptions: ["sales", "marketing", "operations"],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    Multiple SingleSelect Columns
                </Box>
                <Box height={500}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};

// Story 7: Different density modes
type DensityArgs = {
    density: "standard" | "comfortable" | "compact";
};

export const DifferentDensityModes = {
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
    render: ({ density }: DensityArgs) => {
        const columns: GridColDef[] = [
            {
                field: "name",
                headerName: "Product Name",
                flex: 1,
            },
            {
                field: "category",
                headerName: "Category",
                width: 150,
                type: "singleSelect",
                valueOptions: ["electronics", "clothing", "furniture"],
            },
            {
                field: "status",
                headerName: "Status",
                width: 130,
                type: "singleSelect",
                valueOptions: [
                    { value: "active", label: "Active Status" },
                    { value: "inactive", label: "Inactive Status" },
                    { value: "pending", label: "Pending Review" },
                ],
            },
            {
                field: "priority",
                headerName: "Priority",
                width: 130,
                type: "singleSelect",
                valueOptions: [
                    { value: "high", label: "🔴 High Priority" },
                    { value: "medium", label: "🟡 Medium Priority" },
                    { value: "low", label: "🟢 Low Priority" },
                ],
            },
        ];

        return (
            <Box>
                <Box component="h4" sx={{ mb: 2 }}>
                    SingleSelect Filter - {density} Density
                </Box>
                <Box height={500}>
                    <DataGrid
                        density={density}
                        rows={rows}
                        columns={columns}
                        slots={{
                            toolbar: () => (
                                <DataGridToolbar>
                                    <GridFilterButton />
                                </DataGridToolbar>
                            ),
                        }}
                        showToolbar
                    />
                </Box>
            </Box>
        );
    },
};
