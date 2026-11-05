import type { PropsWithChildren } from "react";

import { useIsExactRouteMatch } from "../../common/useIsExactRouteMatch";

export const HiddenInSubroute = ({ children }: PropsWithChildren) => {
    const isExactRouteMatch = useIsExactRouteMatch();

    return isExactRouteMatch ? <>{children}</> : null;
};
