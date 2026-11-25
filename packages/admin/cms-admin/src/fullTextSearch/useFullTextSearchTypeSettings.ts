import { useStoredState } from "@dextinity/admin";
import { useCallback, useMemo } from "react";

import { useCurrentUser } from "../userPermissions/hooks/currentUser";

export interface FullTextSearchType {
    type: string;
    entityName: string;
}

interface FullTextSearchTypeSettings {
    knownTypes: FullTextSearchType[];
    disabledTypes: string[];
}

export function useFullTextSearchTypeSettings() {
    const currentUser = useCurrentUser();
    // The API only returns the types that have results, so the types seen in earlier searches are stored to offer them in the settings
    const [settings, setSettings] = useStoredState<FullTextSearchTypeSettings>(`dextinity.fullTextSearch.typeSettings.${currentUser.id}`, {
        knownTypes: [],
        disabledTypes: [],
    });

    const addKnownTypes = useCallback(
        (types: FullTextSearchType[]) => {
            setSettings((previousSettings) => {
                const newTypes = types
                    .filter(({ type }) => !previousSettings.knownTypes.some((knownType) => knownType.type === type))
                    .map(({ type, entityName }) => ({ type, entityName }));

                return newTypes.length > 0 ? { ...previousSettings, knownTypes: [...previousSettings.knownTypes, ...newTypes] } : previousSettings;
            });
        },
        [setSettings],
    );

    const setTypeEnabled = useCallback(
        (type: string, enabled: boolean) => {
            setSettings((previousSettings) => ({
                ...previousSettings,
                disabledTypes: enabled
                    ? previousSettings.disabledTypes.filter((disabledType) => disabledType !== type)
                    : [...previousSettings.disabledTypes, type],
            }));
        },
        [setSettings],
    );

    const enabledTypes = useMemo(
        () => settings.knownTypes.filter(({ type }) => !settings.disabledTypes.includes(type)),
        [settings.knownTypes, settings.disabledTypes],
    );

    return { knownTypes: settings.knownTypes, disabledTypes: settings.disabledTypes, enabledTypes, addKnownTypes, setTypeEnabled };
}
