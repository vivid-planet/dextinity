import {
    Children,
    type ComponentType,
    createContext,
    forwardRef,
    type ForwardRefRenderFunction,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    useCallback,
    useContext,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { type PathMatch, useLocation } from "react-router";
import { v4 as uuid } from "uuid";

import { useForcePromptRoute } from "../router/ForcePromptRoute";
import { RouteMatchProvider, useCurrentRouteMatch, useMatchAbsolutePath } from "../router/internal/routeContext";
import { useStableNavigate } from "../router/internal/useStableNavigate";
import { SubRouteIndexRoute, useSubRoutePrefix } from "../router/SubRoute";
import { StackBreadcrumb } from "./Breadcrumb";
import type { IStackPageProps } from "./Page";
import { StackSwitchMeta } from "./SwitchMeta";

interface IProps {
    initialPage?: string;
    title?: ReactNode;
    children: Array<ReactElement<IStackPageProps>>;
    disableForcePromptRoute?: boolean;
}

export const StackSwitchApiContext = createContext<IStackSwitchApi>({
    activatePage: () => {
        return;
    },
    getTargetUrl: () => {
        return "";
    },
    updatePageBreadcrumbTitle: () => {
        return;
    },
});
export function useStackSwitchApi() {
    return useContext(StackSwitchApiContext);
}

export interface IStackSwitchApi {
    activatePage: (pageName: string, payload: string, subUrl?: string) => void;
    getTargetUrl: (pageName: string, payload: string, subUrl?: string) => string;
    updatePageBreadcrumbTitle: (title?: ReactNode) => void;
    id?: string;
}
function useUuid() {
    const ref = useRef<string | undefined>(undefined);
    if (ref.current === undefined) {
        ref.current = uuid() as string;
    }
    return ref.current;
}

function removeTrailingSlash(url: string) {
    return url.replace(/\/$/, "");
}

function StackSwitchPageRoute({
    path,
    match,
    forcePrompt,
    children,
}: PropsWithChildren<{ path: string; match: PathMatch | null; forcePrompt?: boolean }>) {
    useForcePromptRoute(forcePrompt ? path : undefined);
    return match ? <RouteMatchProvider match={match}>{children}</RouteMatchProvider> : null;
}

export function useStackSwitch(): [ComponentType<IProps>, IStackSwitchApi] {
    const apiRef = useRef<IStackSwitchApi>(null);
    const id = useUuid();
    const api: IStackSwitchApi = {
        id,
        activatePage: (pageName: string, payload: string, subUrl?: string) => {
            apiRef.current?.activatePage(pageName, payload, subUrl);
        },
        getTargetUrl: (pageName: string, payload: string, subUrl?: string) => {
            if (apiRef.current) {
                return apiRef.current.getTargetUrl(pageName, payload, subUrl);
            } else {
                console.error("apiRef is not attached to a StackSwitch component");
                return "";
            }
        },
        updatePageBreadcrumbTitle: (title?: ReactNode) => {
            apiRef.current?.updatePageBreadcrumbTitle(title);
        },
    };
    const StackSwitchWithHookProps = useMemo(() => {
        return (props: IProps) => {
            return <StackSwitchWithRef {...props} id={id} ref={apiRef} />;
        };
    }, [id, apiRef]);
    return [StackSwitchWithHookProps, api];
}

interface IHookProps {
    id: string;
}

const StackSwitchInner: ForwardRefRenderFunction<IStackSwitchApi, IProps & IHookProps> = (props, ref) => {
    const { id } = props;
    const [pageBreadcrumbTitle, setPageBreadcrumbTitle] = useState<Record<string, string | undefined>>({});
    const navigate = useStableNavigate();
    const routeMatch = useCurrentRouteMatch();
    const subRoutePrefix = useSubRoutePrefix();
    const location = useLocation();
    const matchAbsolutePath = useMatchAbsolutePath();

    let activePage: string | undefined;

    const isInitialPage = useCallback(
        (pageName?: string) => {
            if (!pageName) {
                return true;
            }

            let initialPage = props.initialPage;
            if (!initialPage) {
                initialPage = props.children[0].props.name;
            }
            return initialPage === pageName;
        },
        [props],
    );

    const getTargetUrl = useCallback(
        (pageName: string, payload: string, subUrl?: string): string => {
            if (isInitialPage(pageName)) {
                return removeTrailingSlash(subRoutePrefix) || "/";
            } else {
                return `${removeTrailingSlash(subRoutePrefix)}/${payload}/${pageName}${subUrl ? `/${subUrl}` : ""}`;
            }
        },
        [isInitialPage, subRoutePrefix],
    );

    const activatePage = useCallback(
        (pageName: string, payload: string, subUrl?: string) => {
            const targetUrl = getTargetUrl(pageName, payload, subUrl);
            navigate(targetUrl);

            if (isInitialPage(pageName)) {
                if (payload) {
                    throw new Error("activating the initialPage must not have a payload");
                }
                if (subUrl) {
                    throw new Error("activating the initialPage must not have a subUrl");
                }
            }
        },
        [getTargetUrl, navigate, isInitialPage],
    );

    const api: IStackSwitchApi = useMemo(() => {
        const updatePageBreadcrumbTitle = (t?: string) => {
            if (activePage) {
                const title = { ...pageBreadcrumbTitle };
                title[activePage] = t;
                setPageBreadcrumbTitle(title);
            }
        };
        return {
            activatePage,
            getTargetUrl,
            id,
            updatePageBreadcrumbTitle,
        };
    }, [activatePage, activePage, getTargetUrl, id, pageBreadcrumbTitle]);
    useImperativeHandle(ref, () => api);

    function renderRoute(page: ReactElement<IStackPageProps>, match: PathMatch) {
        activePage = page.props.name;
        const ret = (
            <StackSwitchMeta id={id} activePage={page.props.name} isInitialPageActive={isInitialPage(page.props.name)}>
                <StackSwitchApiContext.Provider value={api}>
                    {typeof page.props.children === "function" ? page.props.children(match.params.id!) : page.props.children}
                </StackSwitchApiContext.Provider>
            </StackSwitchMeta>
        );
        if (isInitialPage(page.props.name)) {
            return ret;
        } else {
            return (
                <StackBreadcrumb
                    url={removeTrailingSlash(match.pathnameBase)}
                    title={pageBreadcrumbTitle[page.props.name] || page.props.title || page.props.name}
                >
                    {ret}
                </StackBreadcrumb>
            );
        }
    }

    if (!routeMatch) {
        return null;
    }

    let routeMatched = false; //to prevent rendering the initial page when a route is matched (as the initial would also match)
    return (
        <>
            {Children.map(props.children, (page: ReactElement<IStackPageProps>) => {
                if (isInitialPage(page.props.name)) {
                    return null;
                } // don't render initial Page
                const path = `${removeTrailingSlash(subRoutePrefix)}/:id/${page.props.name}`;
                const match = matchAbsolutePath(path, location.pathname, { end: false });
                if (match) {
                    routeMatched = true;
                }
                return (
                    <StackSwitchPageRoute path={path} match={match} forcePrompt={!props.disableForcePromptRoute}>
                        {match && renderRoute(page, match)}
                    </StackSwitchPageRoute>
                );
            })}
            {!routeMatched && (
                <SubRouteIndexRoute>
                    {({ match }) => {
                        if (!match) {
                            return null;
                        }
                        // now render initial page (as last route so it's a fallback)
                        let initialPage: ReactElement<IStackPageProps> | null = null;
                        Children.forEach(props.children, (page: ReactElement<IStackPageProps>) => {
                            if (isInitialPage(page.props.name)) {
                                initialPage = page;
                            }
                        });
                        return renderRoute(initialPage!, match);
                    }}
                </SubRouteIndexRoute>
            )}
        </>
    );
};
const StackSwitchWithRef = forwardRef(StackSwitchInner);

export function StackSwitch(props: IProps) {
    const [StackSwitchWithApi] = useStackSwitch();
    return <StackSwitchWithApi {...props} />;
}
