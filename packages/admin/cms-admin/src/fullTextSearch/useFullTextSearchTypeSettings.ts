import { useStoredState } from "@dextinity/admin";
import { useCallback, useMemo } from "react";

import { useCurrentUser } from "../userPermissions/hooks/currentUser";

export interface FullTextSearchType {
    type: string;
    entityName: string;
}

export function useFullTextSearchTypeSettings(types: FullTextSearchType[]) {
    const currentUser = useCurrentUser();
    // The switched off types are stored instead of the switched on ones, so types added later are searched by default
    const [storedDisabledTypes, setStoredDisabledTypes] = useStoredState<string[]>(`dextinity.fullTextSearch.disabledTypes.${currentUser.id}`, []);

    const { disabledTypes, enabledTypes } = useMemo(() => {
        const disabledTypes = types.filter(({ type }) => storedDisabledTypes.includes(type)).map(({ type }) => type);
        // The switched on types may no longer be offered, e.g., after a permission was removed. An empty type list would search all types anyway.
        if (disabledTypes.length === types.length) {
            return { disabledTypes: [], enabledTypes: types };
        }
        return { disabledTypes, enabledTypes: types.filter(({ type }) => !disabledTypes.includes(type)) };
    }, [types, storedDisabledTypes]);

    const setTypeEnabled = useCallback(
        (type: string, enabled: boolean) => {
            setStoredDisabledTypes(enabled ? disabledTypes.filter((disabledType) => disabledType !== type) : [...disabledTypes, type]);
        },
        [disabledTypes, setStoredDisabledTypes],
    );

    return { disabledTypes, enabledTypes, setTypeEnabled };
}
