import useConstant from "use-constant";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function usePersistedStateId(): string {
    const id = useConstant<string>(() => crypto.randomUUID());
    return id;
}
