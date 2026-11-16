import { useCallback, useLayoutEffect, useRef } from "react";
import { type NavigateFunction, type NavigateOptions, type To, useNavigate } from "react-router";

/**
 * Like `useNavigate()`, but the returned function never changes, like v5's `history` didn't.
 * `useNavigate()` returns a new function after every navigation inside routes, which would e.g. recreate the memoized `EditDialog` component.
 * Only use it with absolute paths, relative paths are resolved against the route of the last render.
 */
export function useStableNavigate(): NavigateFunction {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);

    useLayoutEffect(() => {
        navigateRef.current = navigate;
    });

    return useCallback(
        ((to: To | number, options?: NavigateOptions) => {
            if (typeof to === "number") {
                return navigateRef.current(to);
            }
            return navigateRef.current(to, options);
        }) as NavigateFunction,
        [],
    );
}
