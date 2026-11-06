import { useStoredState } from "@dextinity/admin";
import type { DataGridColumnVisibility } from "@dextinity/ui";

/**
 * The `columnVisibility` of a `DataGrid`, remembered in the local storage under `storageKey`.
 */
export function usePersistentColumnVisibility(
    storageKey: string,
    defaultColumnVisibility: DataGridColumnVisibility = {},
): [DataGridColumnVisibility, (columnVisibility: DataGridColumnVisibility) => void] {
    const [storedColumnVisibility, setColumnVisibility] = useStoredState<DataGridColumnVisibility>(storageKey, {});
    return [{ ...defaultColumnVisibility, ...storedColumnVisibility }, setColumnVisibility];
}
