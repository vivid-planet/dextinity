import { type DataGridProps, type GridColumnVisibilityModel, type GridPinnedColumnFields, useGridApiRef } from "@mui/x-data-grid";
import type { DataGridProProps } from "@mui/x-data-grid-pro";
import { type RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useRouteMatch } from "react-router";

import { useStoredState } from "../hooks/useStoredState";
import type { GridColDef } from "./GridColDef";

const useGridColumns = (apiRef: ReturnType<typeof useGridApiRef>) => {
    const [columns, setColumns] = useState<GridColDef[] | undefined>();

    useEffect(() => {
        // This will be `undefined` if the free version of DataGrid V5 is used.

        setColumns(
            // TODO: find a better solution than the `as GridColDef[] | undefined` cast.
            // The problem is, that due to the more complicated GridColDef type, introduced in Mui-X v6 and the override
            // GridColDef type from @dextinity/admin, the types returned from apiRef.current?.getAllColumns?.() are not
            // compatible with the @dextinity/admin GridColDef.
            apiRef.current?.getAllColumns?.() as GridColDef[] | undefined,
        );
    }, [apiRef]);

    return columns;
};

const useVisibilityModelFromColumnMediaQueries = (columns: GridColDef[] | undefined): GridColumnVisibilityModel => {
    const [visibilityModel, setVisibilityModel] = useState<GridColumnVisibilityModel>({});

    useEffect(() => {
        const updateVisibilityModel = () => {
            const visibilityModel: GridColumnVisibilityModel = {};

            columns?.forEach((column: GridColDef) => {
                if (column.visible !== undefined) {
                    if (typeof column.visible === "string") {
                        const mediaQuery = column.visible.replace("@media", "").trim();
                        visibilityModel[column.field] = window.matchMedia(mediaQuery).matches;
                    } else if (column.visible == false) {
                        visibilityModel[column.field] = column.visible;
                    }
                }
            });

            setVisibilityModel(visibilityModel);
        };

        updateVisibilityModel();
        window.addEventListener("resize", updateVisibilityModel);

        return () => {
            window.removeEventListener("resize", updateVisibilityModel);
        };
    }, [columns]);

    return visibilityModel;
};

type GridProps = {
    columnVisibilityModel: DataGridProps["columnVisibilityModel"];
    onColumnVisibilityModelChange: DataGridProps["onColumnVisibilityModelChange"];

    pinnedColumns: DataGridProProps["pinnedColumns"];
    onPinnedColumnsChange: DataGridProProps["onPinnedColumnsChange"];

    onColumnWidthChange: DataGridProProps["onColumnWidthChange"];

    onColumnOrderChange: DataGridProps["onColumnOrderChange"];

    initialState: DataGridProps["initialState"];

    apiRef: RefObject<any>;
};

export function usePersistentColumnState(stateKey: string): GridProps {
    const apiRef = useGridApiRef();
    const columns = useGridColumns(apiRef);
    const match = useRouteMatch();

    const storageKeyPrefix = `${match.path}${stateKey}`;

    const mediaQueryColumnVisibilityModel = useVisibilityModelFromColumnMediaQueries(columns);
    const [storedColumnVisibilityModel, setStoredColumnVisibilityModel] = useStoredState<GridColumnVisibilityModel>(
        `${storageKeyPrefix}ColumnVisibility`,
        {},
    );

    const handleColumnVisibilityModelChange = useCallback(
        (newModel: GridColumnVisibilityModel) => {
            const modelToStore: GridColumnVisibilityModel = {};

            // Do not store column visibility controlled by media queries.
            // This prevents stored values from a previous screen size from overriding the values.
            Object.entries(newModel).forEach(([field, visible]) => {
                const visibilityChangedByUser = mediaQueryColumnVisibilityModel[field] !== visible;
                if (visibilityChangedByUser) {
                    modelToStore[field] = visible;
                }
            });

            setStoredColumnVisibilityModel(modelToStore);
        },
        [mediaQueryColumnVisibilityModel, setStoredColumnVisibilityModel],
    );

    const [pinnedColumns, setPinnedColumns] = useStoredState<GridPinnedColumnFields>(`${storageKeyPrefix}PinnedColumns`, {});
    const handlePinnedColumnsChange = useCallback(
        (newModel: GridPinnedColumnFields) => {
            setPinnedColumns(newModel);
        },
        [setPinnedColumns],
    );

    useEffect(() => {
        // During the first render, `columns` is `undefined`, so we cannot set this as the initial values of the `pinnedColumns` state.
        // We have to wait until the columns are loaded from the `useGridColumns` hook.
        const pinnedColumnsHaveNotYetBeenSet = Object.keys(pinnedColumns).length === 0;
        const columnsHaveBeenLoaded = Boolean(columns);

        if (pinnedColumnsHaveNotYetBeenSet && columnsHaveBeenLoaded) {
            setPinnedColumns({
                left: columns?.filter((column) => column.pinned === "left")?.map((column) => column.field),
                right: columns?.filter((column) => column.pinned === "right")?.map((column) => column.field),
            });
        }
    }, [columns, setPinnedColumns, pinnedColumns]);

    //no API for column dimensions as controlled state, export on change instead
    const columnDimensionsKey = `${storageKeyPrefix}ColumnDimensions`;
    const initialColumnDimensions = useMemo(() => {
        const serializedState = window.localStorage.getItem(columnDimensionsKey);
        return serializedState ? JSON.parse(serializedState) : undefined;
    }, [columnDimensionsKey]);

    const handleColumnWidthChange = useCallback(() => {
        const newState = apiRef.current?.exportState().columns?.dimensions ?? {};
        window.localStorage.setItem(columnDimensionsKey, JSON.stringify(newState));
    }, [columnDimensionsKey, apiRef]);

    //no API for column order as controlled state, export on change instead
    const columnOrderKey = `${storageKeyPrefix}ColumnOrder`;
    const initialColumnOrder = useMemo(() => {
        const serializedState = window.localStorage.getItem(columnOrderKey);
        return serializedState ? JSON.parse(serializedState) : undefined;
    }, [columnOrderKey]);
    const handleColumnOrderChange = useCallback(() => {
        const newState = apiRef.current?.exportState().columns?.orderedFields ?? undefined;
        window.localStorage.setItem(columnOrderKey, JSON.stringify(newState));
    }, [columnOrderKey, apiRef]);

    const initialState = {
        columns: {
            dimensions: initialColumnDimensions,
            orderedFields: initialColumnOrder,
        },
    };

    return {
        columnVisibilityModel: { ...mediaQueryColumnVisibilityModel, ...storedColumnVisibilityModel },
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,

        pinnedColumns,
        onPinnedColumnsChange: handlePinnedColumnsChange,

        onColumnWidthChange: handleColumnWidthChange,

        onColumnOrderChange: handleColumnOrderChange,

        apiRef,
        initialState,
    };
}
