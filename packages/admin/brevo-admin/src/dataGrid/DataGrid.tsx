import { useDextinityConfig } from "@dextinity/cms-admin";
// eslint-disable-next-line no-restricted-imports
import { DataGrid as MuiDataGrid, type DataGridProps, type GridValidRowModel } from "@mui/x-data-grid";

export function DataGrid<R extends GridValidRowModel = GridValidRowModel>(props: DataGridProps<R>) {
    const { dataGrid: { component: ConfiguredDataGrid = MuiDataGrid } = {} } = useDextinityConfig();
    const TypedDataGrid = ConfiguredDataGrid as typeof MuiDataGrid;
    return <TypedDataGrid {...props} />;
}
