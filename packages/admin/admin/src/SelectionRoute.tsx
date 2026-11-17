import { type ComponentType, type PropsWithChildren, type ReactNode, useCallback, useMemo } from "react";

import { RouteMatchProvider, useAbsolutePathMatch } from "./router/internal/routeContext";
import { useStableNavigate } from "./router/internal/useStableNavigate";
import { useSubRoutePrefix } from "./router/SubRoute";
import type { ISelectionApi } from "./SelectionApi";

export function useSelectionRoute(): [ComponentType<IProps>, { id?: string; mode?: "edit" | "add" }, ISelectionApi] {
    const navigate = useStableNavigate();
    const subRoutePrefix = useSubRoutePrefix();
    const match = useAbsolutePathMatch(getSelectionPattern(subRoutePrefix), { end: false });

    const parentUrl = subRoutePrefix;

    const handleSelectId = useCallback(
        async (id: string) => {
            navigate(`${parentUrl}/${id}`);
        },
        [navigate, parentUrl],
    );

    const handleDeselect = useCallback(async () => {
        navigate(parentUrl || "/");
    }, [navigate, parentUrl]);

    const handleAdd = useCallback(
        (id?: string) => {
            navigate(`${parentUrl}/add${id ? `-${id}` : ""}`);
        },
        [navigate, parentUrl],
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

    // Matches with the hook's prefix, not with the prefix where it's rendered: e.g. a hook called outside a Stack selects "<url>/:id",
    // but the Stack's initial page, where the selection is rendered, has the prefix "<url>/index"
    const SelectionRouteConfigured = useMemo(
        () =>
            function SelectionRouteConfigured({ children }: PropsWithChildren<IProps>) {
                return <SelectionRouteMatch urlPrefix={subRoutePrefix}>{children}</SelectionRouteMatch>;
            },
        [subRoutePrefix],
    );

    return [SelectionRouteConfigured, selection, api];
}

function getSelectionPattern(urlPrefix: string) {
    return `${urlPrefix}/:id`;
}

function SelectionRouteMatch({ urlPrefix, children }: PropsWithChildren<{ urlPrefix: string }>) {
    const match = useAbsolutePathMatch(getSelectionPattern(urlPrefix), { end: false });
    return <RouteMatchProvider match={match}>{children}</RouteMatchProvider>;
}

export interface ISelectionRouterRenderPropArgs {
    selectedId?: string;
    selectionMode?: "edit" | "add";
    selectionApi: ISelectionApi;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps {}
export const SelectionRouteInner = ({ children }: PropsWithChildren<IProps>) => {
    const subRoutePrefix = useSubRoutePrefix();
    return <SelectionRouteMatch urlPrefix={subRoutePrefix}>{children}</SelectionRouteMatch>;
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
