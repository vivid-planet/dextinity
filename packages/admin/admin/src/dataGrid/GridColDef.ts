import type {
    GridActionsColDef as MuiGridActionsColDef,
    GridFilterItem,
    GridPinnedColumns,
    GridSingleSelectColDef as MuiGridSingleSelectColDef,
    GridValidRowModel,
    GridValueOptionsParams,
} from "@mui/x-data-grid";
import type { GridBaseColDef as MuiGridBaseColDef } from "@mui/x-data-grid/internals";
import type { ReactNode } from "react";

import type { GqlFilter } from "./muiGridFilterToGql";

type ValueOption =
    | string
    | number
    | {
          value: any;
          label: string;
          cellContent?: ReactNode;
      };

type GridColDefExtension<R extends GridValidRowModel = any> = {
    valueOptions?: Array<ValueOption> | ((params: GridValueOptionsParams<R>) => Array<ValueOption>);
    /**
     * Media query to define when the column is visible.
     * Set to false to initially hide the column.
     * Requires DataGridPro or DataGridPremium.
     */
    visible?: string | false;
    /**
     * Requires DataGridPro or DataGridPremium.
     */
    sortBy?: string | string[];
    /**
     * Requires DataGridPro or DataGridPremium.
     */
    pinned?: keyof GridPinnedColumns;
    /**
     * Callback to convert a filter item to a GQL filter.
     */
    toGqlFilter?: (filterItem: GridFilterItem) => GqlFilter;
};

export type GridBaseColDef<R extends GridValidRowModel = any, V = any, F = V> = MuiGridBaseColDef<R, V, F> & GridColDefExtension<R>;
export type GridActionsColDef<R extends GridValidRowModel = any, V = any, F = V> = MuiGridActionsColDef<R, V, F> & GridColDefExtension<R>;
export type GridSingleSelectColDef<R extends GridValidRowModel = any, V = any, F = V> = MuiGridSingleSelectColDef<R, V, F> & GridColDefExtension<R>;
export type GridColDef<R extends GridValidRowModel = any, V = any, F = V> =
    GridBaseColDef<R, V, F> | GridActionsColDef<R, V, F> | GridSingleSelectColDef<R, V, F>;
