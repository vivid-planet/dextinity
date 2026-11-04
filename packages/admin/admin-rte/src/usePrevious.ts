import { useEffect, useRef } from "react";

// https://usehooks.com/usePrevious/

type GenericOrUndefined<T> = T | undefined;

export default function usePrevious<T>(value: T): GenericOrUndefined<T> {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef<T>(undefined);

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    if (ref.current === undefined) {
        return undefined;
    }
    return ref.current;
}
