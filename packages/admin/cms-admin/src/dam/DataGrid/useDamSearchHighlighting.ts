import escapeRegExp from "lodash.escaperegexp";
import { useMemo } from "react";

import type { TextMatch } from "../../common/MarkedMatches";

type DamItems = Array<{ id: string; name: string }>;
export type DamItemMatches = Map<string, TextMatch[]>;

interface DamSearchHighlightingApi {
    matches: DamItemMatches;
}

interface UseDamSearchHighlightingParams {
    items: DamItems;
    query: string;
}

export const useDamSearchHighlighting = ({ items, query }: UseDamSearchHighlightingParams): DamSearchHighlightingApi => {
    const matches = useMemo(() => {
        const matches = new Map<string, TextMatch[]>();
        if (!query) {
            return matches;
        }

        const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");

        items.forEach((item) => {
            let match;

            while ((match = regex.exec(item.name)) !== null) {
                const existingMatches = matches.get(item.id);

                matches.set(item.id, [
                    ...(existingMatches || []),
                    {
                        start: match.index,
                        end: match.index + query.length - 1,
                        focused: matches.size === 0,
                    },
                ]);
            }
        });

        return matches;
    }, [items, query]);

    return { matches };
};
