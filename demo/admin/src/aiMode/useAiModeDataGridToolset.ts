import type { GridColDef } from "@dextinity/admin";
import type { GridFilterModel } from "@mui/x-data-grid-pro";
import { useRef } from "react";

import { useAiModeToolset } from "./AiModeToolsets";
import { type AiModeDataGridState, createDataGridTools } from "./dataGridTools";

/**
 * Lets the AI Mode read and change the view of a grid with server-side filtering, sorting, and pagination, and open its
 * rows if they have a form. Call it in the component that renders the grid, with the props of `useDataGridRemote` and the rows of the grid's query.
 */
export function useAiModeDataGridToolset({
    entityName,
    entityLabel,
    columns,
    dataGridProps,
    rows,
    totalCount,
    isLoading,
    openEditForm,
    openAddForm,
}: {
    /** Names the toolset and the tools, in snake case, e.g. "news" or "product_variant". */
    entityName: string;
    /** Names the entities for the agent, in the plural, e.g. "news articles". */
    entityLabel: string;
    columns: GridColDef[];
    dataGridProps: Omit<AiModeDataGridState, "filterModel"> & { filterModel?: GridFilterModel };
    rows: Array<Record<string, unknown>>;
    totalCount?: number;
    isLoading: boolean;
    /** Opens the form of the entity with the given ID. Leave it out for a grid whose rows have no form. */
    openEditForm?: (id: string) => void;
    /** Opens the form for a new entity. Leave it out for a grid without one. */
    openAddForm?: () => void;
}) {
    // Read by the tools while they wait for a change of the view to render.
    const state: AiModeDataGridState = { ...dataGridProps, filterModel: dataGridProps.filterModel ?? { items: [] } };
    const stateRef = useRef(state);
    stateRef.current = state;

    const { filterModel, sortModel, paginationModel } = state;

    useAiModeToolset({
        id: `${entityName}_grid`,
        description: `The grid of the ${entityLabel}, where the user finds them${openEditForm ? " and opens one to edit it" : ""}.`,
        context: {
            search: filterModel.quickFilterValues?.join(" ") ?? "",
            filters: filterModel.items.length,
            sort: sortModel.map(({ field, sort }) => ({ field, direction: sort })),
            page: paginationModel.page,
            totalCount,
        },
        tools: createDataGridTools({
            entityName,
            entityLabel,
            columns,
            getState: () => stateRef.current,
            rows,
            totalCount,
            isLoading,
            openEditForm,
            openAddForm,
        }),
    });
}
