import { AbsoluteRoute, useCurrentRouteMatch } from "@dextinity/admin";
import type { ReactNode } from "react";

export const HiddenInSubroute = ({ children }: { children?: ReactNode }) => {
    const match = useCurrentRouteMatch();

    return (
        <AbsoluteRoute path={match.url} exact>
            {children}
        </AbsoluteRoute>
    );
};
