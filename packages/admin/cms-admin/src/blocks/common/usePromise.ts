import { useEffect, useState } from "react";

interface UsePromiseOptions<S> {
    initialValue: S;
}

export function usePromise(): undefined; // For convinience, the caller doesnt need to check for existance of the fn before using the hook
export function usePromise<S>(fn: undefined | (() => Promise<S> | S)): S | undefined; // Without initial value the return maybe undefined (until the first promise is resolved)
export function usePromise<S>(fn: undefined | (() => Promise<S> | S), options: UsePromiseOptions<S>): S; // Initial values are given, return is never undefined
export function usePromise<S>(fn?: undefined | (() => Promise<S> | S), options?: UsePromiseOptions<S>): S | undefined {
    const [state, setState] = useState(() => {
        if (options) {
            return options.initialValue;
        }
        return undefined;
    });
    useEffect(() => {
        // @TODO: add throtteling- or debouncing-options to avoid evaluating the promise on every render
        const evaluateFn = async () => {
            if (fn) {
                const result = await fn();
                setState(result);
            }
        };
        void evaluateFn();
    }, [fn]);

    return state;
}
