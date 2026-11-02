import { useCurrentRouteMatch, useStoredState } from "@dextinity/admin";
import { useEffect, useRef } from "react";
import { matchPath, Navigate, useLocation } from "react-router";

interface RedirectToPersistedDamLocationProps {
    stateKey: string;
}

export const RedirectToPersistedDamLocation = ({ stateKey }: RedirectToPersistedDamLocationProps) => {
    const location = useLocation();
    const match = useCurrentRouteMatch();

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
        matchPath({ path: match.url, end: true }, location.pathname)
    ) {
        return <Navigate to={persistedDamLocation} replace />;
    }

    return null;
};
