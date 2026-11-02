import { ErrorBoundary, useCurrentRouteMatch } from "@dextinity/admin";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";

import { type Permission, useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import type { MasterMenuData, MasterMenuItem, MasterMenuRoute } from "./MasterMenu";

export function useRoutePropsFromMasterMenuData(items: MasterMenuData): MasterMenuRoute[] {
    const isAllowed = useUserPermissionCheck();
    const checkPermission = (item: MasterMenuItem, ancestors: MasterMenuItem[]): boolean => {
        function getRequiredPermissionsArray(permission: Permission | Permission[]): Permission[] {
            return Array.isArray(permission) ? permission : [permission];
        }

        let allowed = true;

        if (item.requiredPermission) {
            allowed &&= getRequiredPermissionsArray(item.requiredPermission).some((permission) => isAllowed(permission));
        }

        for (const ancestor of ancestors) {
            if (ancestor.requiredPermission) {
                allowed &&= getRequiredPermissionsArray(ancestor.requiredPermission).some((permission) => isAllowed(permission));
            }
        }

        return allowed;
    };

    const flat = (
        routes: MasterMenuRoute[],
        item: MasterMenuItem & { icon?: ReactNode },
        ancestors: Array<MasterMenuItem & { icon?: ReactNode }>,
    ): MasterMenuRoute[] => {
        if (item.type === "externalLink") {
            return routes;
        }
        if (item.type === "group") {
            return routes.concat(item.items.reduce((routes, child) => flat(routes, child, [...ancestors, item]), [] as MasterMenuRoute[]));
        }
        if (item.route && checkPermission(item, ancestors)) {
            routes = routes.concat(item.route);
        }
        if (item.type === "collapsible" && !!item.items?.length) {
            routes = routes.concat(
                (item.items as Array<MasterMenuItem & { icon?: ReactNode }>).reduce(
                    (routes, child) => flat(routes, child, [...ancestors, item]),
                    [] as MasterMenuRoute[],
                ),
            );
        }
        return routes;
    };
    return items.reduce((routes, item) => flat(routes, item, []), [] as MasterMenuRoute[]);
}

export interface MasterMenuRoutesProps {
    menu: MasterMenuData;
}

export const MasterMenuRoutes = ({ menu }: MasterMenuRoutesProps) => {
    const routes = useRoutePropsFromMasterMenuData(menu);
    const scopeUrl = useCurrentRouteMatch().url.replace(/\/$/, "");

    return (
        <Routes>
            <Route index element={<Navigate to={`${scopeUrl}${routes[0].path}`} replace />} />
            {routes.map((route) => (
                <Route
                    key={route.path}
                    path={`${route.path.replace(/^\//, "")}/*`}
                    element={<ErrorBoundary key={route.path}>{route.element}</ErrorBoundary>}
                />
            ))}
        </Routes>
    );
};
