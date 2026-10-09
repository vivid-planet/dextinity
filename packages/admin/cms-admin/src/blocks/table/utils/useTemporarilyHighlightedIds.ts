import { useCallback, useEffect, useRef, useState } from "react";

const highlightDurationMs = 5_000;

export const useTemporarilyHighlightedIds = () => {
    const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
    const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout));
        };
    }, []);

    const highlightTemporarily = useCallback((id: string) => {
        setHighlightedIds((prev) => [...prev, id]);

        const timeoutId = setTimeout(() => {
            setHighlightedIds((prev) => prev.filter((prevId) => prevId !== id));
            timeoutsRef.current.delete(timeoutId);
        }, highlightDurationMs);

        timeoutsRef.current.add(timeoutId);
    }, []);

    return {
        highlightedIds,
        highlightTemporarily,
    };
};
