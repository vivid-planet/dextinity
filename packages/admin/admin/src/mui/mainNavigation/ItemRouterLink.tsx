import { Badge } from "@mui/material";
import type { ListItemProps } from "@mui/material/ListItem";
import type { ReactNode } from "react";
import { createPath, Link, type LinkProps, useLocation, useResolvedPath } from "react-router";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { matchAbsolutePath, RouteMatchProvider } from "../../router/internal/routeContext";
import { MainNavigationItem, type MainNavigationItemProps } from "./Item";

interface MainNavigationRouterLinkItemStandardProps extends ThemedComponentBaseProps<{
    badge: typeof Badge;
}> {
    to: string;
    badgeContent?: ReactNode;
}

export type MainNavigationItemRouterLinkProps = MainNavigationRouterLinkItemStandardProps & MainNavigationItemProps & ListItemProps & LinkProps;

export const MainNavigationItemRouterLink = ({
    badgeContent,
    secondaryAction: passedSecondaryAction,
    slotProps,
    ...restProps
}: MainNavigationItemRouterLinkProps) => {
    const { badge, ...mainNavigationItemSlotProps } = slotProps ?? {};
    const { pathname } = useLocation();
    const resolvedPath = useResolvedPath(restProps.to, { relative: restProps.relative });
    const match = matchAbsolutePath(resolvedPath.pathname, pathname, { end: false });
    // Resolved before publishing the match, which would otherwise become the base of a relative `to`
    const linkProps = { ...restProps, to: createPath(resolvedPath) };

    const secondaryAction = badgeContent ? ( // prioritize badgeContent over passed secondaryAction
        <Badge
            variant={restProps.isMenuOpen ? "standard" : "dot"}
            color="error"
            overlap="circular"
            {...badge}
            badgeContent={badgeContent}
            sx={{ marginLeft: 2, ...badge?.sx }}
        />
    ) : (
        passedSecondaryAction
    );

    return (
        <RouteMatchProvider match={match}>
            <MainNavigationItem
                selected={!!match}
                secondaryAction={secondaryAction}
                component={Link}
                slotProps={mainNavigationItemSlotProps}
                {...linkProps}
            />
        </RouteMatchProvider>
    );
};
