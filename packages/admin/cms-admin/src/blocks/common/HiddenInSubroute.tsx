import type { ReactNode } from "react";
import { Route, useRouteMatch } from "react-router";

export const HiddenInSubroute = ({ children }: { children?: ReactNode }) => {
    const match = useRouteMatch();

    return (
        <Route path={match.url} exact>
            {children}
        </Route>
    );
};
