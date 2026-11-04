import { type ReactNode, useCallback, useMemo, useState } from "react";

import type { ISelectionApi } from "./SelectionApi";

interface IState {
    id?: string;
    mode?: "edit" | "add";
}
export function useSelection(): [{ id?: string; mode?: "edit" | "add" }, ISelectionApi] {
    const [selection, setSelection] = useState<IState>({ id: undefined, mode: undefined });

    const handleSelectId = useCallback(
        async (id: string) => {
            setSelection({ id, mode: "edit" });
        },
        [setSelection],
    );

    const handleDeselect = useCallback(async () => {
        setSelection({ id: undefined, mode: undefined });
    }, [setSelection]);

    const handleAdd = useCallback(
        (id?: string) => {
            setSelection({ id, mode: "add" });
        },
        [setSelection],
    );

    const api: ISelectionApi = useMemo(
        () => ({
            handleSelectId,
            handleDeselect,
            handleAdd,
        }),
        [handleSelectId, handleDeselect, handleAdd],
    );

    return [
        {
            id: selection.id,
            mode: selection.mode,
        },
        api,
    ];
}

export interface ISelectionRenderPropArgs {
    selectedId?: string;
    selectionMode?: "edit" | "add";
    selectionApi: ISelectionApi;
}

interface IProps {
    children: (injectedProps: ISelectionRenderPropArgs) => ReactNode;
}

export function Selection({ children }: IProps) {
    const [selection, api] = useSelection();
    return (
        <>
            {children({
                selectedId: selection.id,
                selectionMode: selection.mode,
                selectionApi: api,
            })}
        </>
    );
}
