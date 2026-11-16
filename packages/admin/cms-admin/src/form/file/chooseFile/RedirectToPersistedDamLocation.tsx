import { useStoredState } from "@dextinity/admin";
import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router";

import { useIsExactRouteMatch } from "../../../common/useIsExactRouteMatch";

interface RedirectToPersistedDamLocationProps {
    stateKey: string;
}

export const RedirectToPersistedDamLocation = ({ stateKey }: RedirectToPersistedDamLocationProps) => {
    const location = useLocation();
    const isExactRouteMatch = useIsExactRouteMatch();

    const isInitialRender = useRef(true);
    const [persistedDamLocation, setPersistedDamLocation] = useStoredState<string>(stateKey, location.pathname, window.sessionStorage);

    useEffect(() => {
        setPersistedDamLocation(location.pathname);
    }, [location.pathname, setPersistedDamLocation]);

    useEffect(() => {
        isInitialRender.current = false;
    }, []);

    if (
        // the redirect should only happen on initial render
        isInitialRender.current &&
        // only redirect on exact match ("/" in image block and "/{domain}/{lang}/assets" in DAM)
        isExactRouteMatch
    ) {
        return <Navigate to={persistedDamLocation} replace />;
    }

    return null;
};
