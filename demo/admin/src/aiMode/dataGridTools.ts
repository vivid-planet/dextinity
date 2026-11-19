import type { GridColDef } from "@dextinity/admin";
import {
    getGridBooleanOperators,
    getGridDateOperators,
    getGridNumericOperators,
    getGridSingleSelectOperators,
    getGridStringOperators,
    type GridCallbackDetails,
    type GridFilterModel,
    type GridPaginationModel,
    type GridSortModel,
} from "@mui/x-data-grid-pro";

import type { AiModeTool } from "./AiModeToolsets";

/** The controlled state of a grid with server-side filtering, sorting, and pagination, as `useDataGridRemote` returns it. */
export type AiModeDataGridState = {
    filterModel: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel, details: GridCallbackDetails) => void;
    sortModel: GridSortModel;
    onSortModelChange?: (model: GridSortModel, details: GridCallbackDetails) => void;
    paginationModel: GridPaginationModel;
    onPaginationModelChange?: (model: GridPaginationModel, details: GridCallbackDetails) => void;
};

// The change handlers of `useDataGridRemote` read only the model; the details describe a change made in the grid itself.
const changeDetails = {} as GridCallbackDetails;

const stateChangeTimeoutMs = 2000;

// Each change handler of `useDataGridRemote` writes the URL from the search params of its render, so a second change
// before the grid rendered the first one would undo it.
async function waitUntil(isApplied: () => boolean) {
    const start = Date.now();
    while (!isApplied()) {
        if (Date.now() - start > stateChangeTimeoutMs) {
            throw new Error("The grid didn't show the change. Read its rows to see what it shows now.");
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

const isSameModel = (first: unknown, second: unknown) => JSON.stringify(first) === JSON.stringify(second);

function getDefaultFilterOperators(type: GridColDef["type"]) {
    switch (type) {
        case "date":
        case "dateTime":
            return getGridDateOperators();
        case "number":
            return getGridNumericOperators();
        case "boolean":
            return getGridBooleanOperators();
        case "singleSelect":
            return getGridSingleSelectOperators();
        default:
            return getGridStringOperators();
    }
}

function getFilterOperators(column: GridColDef) {
    return (column.filterOperators ?? getDefaultFilterOperators(column.type)).map(({ value }) => value);
}

const isDataColumn = (column: GridColDef) => column.type !== "actions";

const isPrimitive = (value: unknown) => value === null || ["string", "number", "boolean"].includes(typeof value);

/**
 * The row as the agent gets it: the values of the grid's columns that are text, numbers, or booleans, plus the ID.
 * Block previews and other rendered values are left out, because the agent can't read them.
 */
function summarizeRow(row: Record<string, unknown>, columns: GridColDef[]) {
    const summary: Record<string, unknown> = { id: row.id };
    for (const column of columns.filter(isDataColumn)) {
        const value = row[column.field];
        if (isPrimitive(value)) {
            summary[column.field] = value;
        }
    }
    return summary;
}

type FilterItem = { field: string; operator: string; value?: unknown };

function asFilterItems(filters: unknown, columns: GridColDef[]): FilterItem[] {
    if (!Array.isArray(filters)) {
        throw new Error('"filters" must be a list of filters, each with a "field", an "operator", and usually a "value".');
    }

    return filters.map((filter: unknown, index) => {
        const { field, operator, value } = (filter ?? {}) as Partial<FilterItem>;
        const column = columns.find((candidate) => candidate.field === field && isDataColumn(candidate) && candidate.filterable !== false);
        if (!column) {
            const filterable = columns.filter((candidate) => isDataColumn(candidate) && candidate.filterable !== false).map(({ field }) => field);
            throw new Error(`Filter ${index + 1}: "${field}" is no column that can be filtered. These can: ${filterable.join(", ")}.`);
        }
        const operators = getFilterOperators(column);
        if (typeof operator !== "string" || !operators.includes(operator)) {
            throw new Error(`Filter ${index + 1}: "${operator}" is no operator of the column "${field}". It has: ${operators.join(", ")}.`);
        }
        return { field: column.field, operator, value };
    });
}

function asSortModel(sort: unknown, columns: GridColDef[]): GridSortModel {
    if (!Array.isArray(sort)) {
        throw new Error('"sort" must be a list of sortings, each with a "field" and a "direction".');
    }

    return sort.map((sortItem: unknown, index) => {
        const { field, direction } = (sortItem ?? {}) as { field?: string; direction?: string };
        const column = columns.find((candidate) => candidate.field === field && isDataColumn(candidate) && candidate.sortable !== false);
        if (!column) {
            const sortable = columns.filter((candidate) => isDataColumn(candidate) && candidate.sortable !== false).map(({ field }) => field);
            throw new Error(`Sorting ${index + 1}: "${field}" is no column the grid can be sorted by. It can by: ${sortable.join(", ")}.`);
        }
        if (direction !== "asc" && direction !== "desc") {
            throw new Error(`Sorting ${index + 1}: the direction must be "asc" or "desc", but is "${direction}".`);
        }
        return { field: column.field, sort: direction };
    });
}

/**
 * The tools of an entity's grid: `get_<entity>_grid_rows`, `set_<entity>_grid_view`, and `open_<entity>_form`. They
 * use the grid's own state and query, so the agent sees what the user sees, and the API checks the permissions as for the
 * grid itself.
 */
export function createDataGridTools({
    entityName,
    entityLabel,
    columns,
    getState,
    rows,
    totalCount,
    isLoading,
    openForm,
}: {
    /** Names the tools, in snake case, e.g. "news" or "product_variant". */
    entityName: string;
    /** Names the entities in the tool descriptions, in the plural, e.g. "news articles". */
    entityLabel: string;
    columns: GridColDef[];
    /** The grid's state of the latest render, which a change of the view replaces. */
    getState: () => AiModeDataGridState;
    rows: Array<Record<string, unknown>>;
    totalCount?: number;
    /** Whether the grid's query is loading, e.g. right after the view changed, so that the rows are those of the previous view. */
    isLoading: boolean;
    /** Opens the form of the entity with the given ID, or the form for a new one without. */
    openForm: (id?: string) => void;
}): AiModeTool[] {
    const dataColumns = columns.filter(isDataColumn);

    return [
        {
            name: `get_${entityName}_grid_rows`,
            description:
                `Get the ${entityLabel} the grid open in the admin shows: the rows of the current page, the total number of rows, and the grid's search, filters, sorting, and page. ` +
                `A row has its ID and the values of the columns ${dataColumns.map(({ field, headerName }) => (headerName ? `${field} (${headerName})` : field)).join(", ")} that are text, numbers, or booleans. ` +
                `To search, filter, sort, or page, use set_${entityName}_grid_view; to open a row, use open_${entityName}_form.`,
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => {
                const state = getState();
                if (isLoading) {
                    return "The grid is still loading its rows. Read them again in a moment.";
                }
                return {
                    rows: rows.map((row) => summarizeRow(row, columns)),
                    totalCount,
                    search: state.filterModel.quickFilterValues?.join(" ") ?? "",
                    filters: state.filterModel.items.map(({ field, operator, value }) => ({ field, operator, value })),
                    sort: state.sortModel.map(({ field, sort }) => ({ field, direction: sort })),
                    page: state.paginationModel.page,
                    pageSize: state.paginationModel.pageSize,
                };
            },
        },
        {
            name: `set_${entityName}_grid_view`,
            description:
                `Change what the ${entityLabel} grid open in the admin shows: its search, filters, sorting, or page. Each argument that is passed replaces the grid's current one; one that is left out stays. ` +
                `Changing the search or the filters goes back to the first page. Afterwards, read the rows with get_${entityName}_grid_rows. ` +
                `The filterable columns and their operators are: ${dataColumns
                    .filter((column) => column.filterable !== false)
                    .map((column) => `${column.field} (${getFilterOperators(column).join(", ")})`)
                    .join("; ")}. A date is passed as YYYY-MM-DD, "isAnyOf" takes a list, and "isEmpty" and "isNotEmpty" take no value.`,
            inputSchema: {
                type: "object",
                properties: {
                    search: { type: "string", description: "The text of the grid's search field; an empty string clears it." },
                    filters: {
                        type: "array",
                        description: "The filters, all of which a row has to match; an empty list clears them.",
                        items: {
                            type: "object",
                            properties: { field: { type: "string" }, operator: { type: "string" }, value: {} },
                            required: ["field", "operator"],
                        },
                    },
                    sort: {
                        type: "array",
                        description: "The sorting, by the first column first; an empty list clears it.",
                        items: {
                            type: "object",
                            properties: { field: { type: "string" }, direction: { type: "string", enum: ["asc", "desc"] } },
                            required: ["field", "direction"],
                        },
                    },
                    page: { type: "number", description: "The page to show, counted from 0." },
                },
            },
            // Changing the view changes no data, so the chat runs it without asking.
            readOnlyHint: true,
            handler: async (args) => {
                // Checked before anything changes, so that a wrong argument changes nothing.
                const filterItems = args.filters === undefined ? undefined : asFilterItems(args.filters, columns);
                const sortModel = args.sort === undefined ? undefined : asSortModel(args.sort, columns);
                const search = args.search === undefined ? undefined : String(args.search);
                const requestedPage = args.page === undefined ? undefined : Number(args.page);
                if (requestedPage !== undefined && (!Number.isInteger(requestedPage) || requestedPage < 0)) {
                    throw new Error(`"page" must be a page number counted from 0, but is ${String(args.page)}.`);
                }

                // Each change knows which part of the state it changes, to wait until the grid rendered it.
                type Change = { apply: (state: AiModeDataGridState) => void; getModel: (state: AiModeDataGridState) => unknown };
                const changes: Change[] = [];

                const initialState = getState();
                let hasNewFilter = false;
                if (filterItems !== undefined || search !== undefined) {
                    const filterModel: GridFilterModel = {
                        ...initialState.filterModel,
                        items: (filterItems ?? initialState.filterModel.items).map((item, index) => ({ id: index, ...item })),
                        quickFilterValues: search === undefined ? initialState.filterModel.quickFilterValues : search.split(" ").filter(Boolean),
                    };
                    if (!isSameModel(filterModel, initialState.filterModel)) {
                        hasNewFilter = true;
                        changes.push({
                            apply: (state) => state.onFilterModelChange?.(filterModel, changeDetails),
                            getModel: (state) => state.filterModel,
                        });
                    }
                }
                if (sortModel !== undefined && !isSameModel(sortModel, initialState.sortModel)) {
                    changes.push({ apply: (state) => state.onSortModelChange?.(sortModel, changeDetails), getModel: (state) => state.sortModel });
                }
                // A new search or filter starts on the first page, as it does in the grid, so that it doesn't show an empty page.
                const page = requestedPage ?? (hasNewFilter ? 0 : undefined);
                if (page !== undefined && page !== initialState.paginationModel.page) {
                    changes.push({
                        apply: (state) => state.onPaginationModelChange?.({ ...state.paginationModel, page }, changeDetails),
                        getModel: (state) => state.paginationModel,
                    });
                }

                for (const [index, { apply, getModel }] of changes.entries()) {
                    const previousModel = getModel(getState());
                    apply(getState());
                    if (index < changes.length - 1) {
                        await waitUntil(() => !isSameModel(getModel(getState()), previousModel));
                    }
                }

                return changes.length > 0
                    ? `Changed the view of the ${entityLabel} grid. Read the rows it shows now with get_${entityName}_grid_rows.`
                    : `The ${entityLabel} grid already shows this view.`;
            },
        },
        {
            name: `open_${entityName}_form`,
            description:
                `Open the form of one of the ${entityLabel}, e.g. a row found with get_${entityName}_grid_rows, or without an ID, the form for a new one. ` +
                "Once it is open, the form offers its own tools to read and fill it in.",
            inputSchema: {
                type: "object",
                properties: { id: { type: "string", description: "The ID of the row to open. Leave it out to open the form for a new one." } },
            },
            // Navigating changes no data, so the chat runs it without asking.
            readOnlyHint: true,
            handler: (args) => {
                if (args.id === undefined) {
                    openForm();
                    return `Opened the form for a new one of the ${entityLabel}.`;
                }

                const id = String(args.id);
                if (id === "") {
                    throw new Error('"id" must be the ID of a row, or be left out to open the form for a new one.');
                }
                openForm(id);
                return `Opened the form of the row ${id}.`;
            },
        },
    ];
}
