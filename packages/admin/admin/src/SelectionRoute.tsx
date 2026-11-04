import { type ComponentType, type PropsWithChildren, type ReactNode, useCallback, useMemo } from "react";
import { Route, useHistory, useRouteMatch } from "react-router";

import { useSubRoutePrefix } from "./router/SubRoute";
import type { ISelectionApi } from "./SelectionApi";

interface IRouteParams {
    id?: string;
}

export function useSelectionRoute(): [ComponentType<IProps>, { id?: string; mode?: "edit" | "add" }, ISelectionApi] {
    const history = useHistory();
    const subRoutePrefix = useSubRoutePrefix();
    const match = useRouteMatch<IRouteParams>(`${subRoutePrefix}/:id`);

    const parentUrl = subRoutePrefix;

    const handleSelectId = useCallback(
        async (id: string) => {
            history.push(`${parentUrl}/${id}`);
        },
        [history, parentUrl],
    );

    const handleDeselect = useCallback(async () => {
        history.push(`${parentUrl}`);
    }, [history, parentUrl]);

    const handleAdd = useCallback(
        (id?: string) => {
            history.push(`${parentUrl}/add${id ? `-${id}` : ""}`);
        },
        [history, parentUrl],
    );

    const api: ISelectionApi = useMemo(
        () => ({
            handleSelectId,
            handleDeselect,
            handleAdd,
        }),
        [handleSelectId, handleDeselect, handleAdd],
    );

    const routeId: string | null = match && match.params.id ? match.params.id : null;
    const selection = useMemo(() => {
        let selectedId: string | undefined;
        let selectionMode: "edit" | "add" | undefined;
        if (routeId && (routeId === "add" || routeId.startsWith("add-"))) {
            selectedId = routeId.startsWith("add-") ? routeId.substr(4) : undefined;
            selectionMode = "add";
        } else if (routeId) {
            selectedId = routeId;
            selectionMode = "edit";
        }

        return {
            id: selectedId,
            mode: selectionMode,
        };
    }, [routeId]);

    return [SelectionRouteInner, selection, api];
}

export interface ISelectionRouterRenderPropArgs {
    selectedId?: string;
    selectionMode?: "edit" | "add";
    selectionApi: ISelectionApi;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps {}
export const SelectionRouteInner = ({ children }: PropsWithChildren<IProps>) => {
    const { path } = useRouteMatch();
    return <Route path={`${path}/:id`}>{() => <>{children}</>}</Route>;
};

interface ISelectionRouteHooklessProps extends IProps {
    children: (injectedProps: { selectedId?: string; selectionMode?: "edit" | "add"; selectionApi: ISelectionApi }) => ReactNode;
}

export const SelectionRoute = ({ children }: ISelectionRouteHooklessProps) => {
    const [SelectionRouteConfigured, selection, api] = useSelectionRoute();
    return (
        <SelectionRouteConfigured>
            {children({ selectedId: selection.id, selectionMode: selection.mode, selectionApi: api })}
        </SelectionRouteConfigured>
    );
};
