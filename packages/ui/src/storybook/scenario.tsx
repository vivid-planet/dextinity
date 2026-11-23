import type { PropsWithChildren } from "react";

import { Button } from "../components/button/Button";
import { EmptyState } from "../components/emptyState/EmptyState";
import { Icon } from "../components/icon/Icon";
import { Skeleton } from "../components/skeleton/Skeleton";
import { createToolbarSetting } from "./toolbarSetting";

export type Scenario = "default" | "empty" | "few" | "many" | "long" | "error" | "loading";

/**
 * The content a prototype shows: its sample data, or one of the cases a designer checks a page against, e.g. no entries yet, many,
 * or a failed request.
 */
export const scenarioSetting = createToolbarSetting<Scenario>({
    storageKey: "dextinity-ui-workspace-scenario",
    titles: {
        default: "Sample content",
        empty: "Empty",
        few: "Few entries",
        many: "Many entries",
        long: "Long texts",
        error: "Error",
        loading: "Loading",
    },
    defaultValue: "default",
});

export function useScenario() {
    return scenarioSetting.useValue();
}

const longSuffix = " – with an unusually long name that wraps over several lines, as real content sometimes does";
const manyCopies = 6;

/** Makes a text as long as real content sometimes gets, for the `long` scenario. */
export function lengthen(text: string) {
    return `${text}${longSuffix}`;
}

/**
 * The entries a list shows in the scenario: none, the first two, six times as many, or all with long texts. `copy` makes the
 * extra entries of `many` distinct, `stretch` gives an entry long texts.
 */
export function applyScenario<Item>(
    items: readonly Item[],
    scenario: Scenario,
    { copy, stretch }: { copy?: (item: Item, round: number) => Item; stretch?: (item: Item) => Item } = {},
): Item[] {
    switch (scenario) {
        case "empty":
        case "error":
        case "loading":
            return [];
        case "few":
            return items.slice(0, 2);
        case "many":
            return copy
                ? Array.from({ length: manyCopies }, (_, round) => items.map((item) => (round === 0 ? item : copy(item, round)))).flat()
                : [...items];
        case "long":
            return stretch ? items.map(stretch) : [...items];
        default:
            return [...items];
    }
}

/**
 * Shows a list's area as the scenario has it: rows still loading, a failed request with a retry, or the list itself. `empty` is the
 * list's own empty state, since only the page knows what to say there.
 */
export function ScenarioContent({ scenario, children }: PropsWithChildren<{ scenario: Scenario }>) {
    if (scenario === "loading") {
        return <Skeleton variant="row" count={6} />;
    }
    if (scenario === "error") {
        return (
            <EmptyState
                icon={<Icon name="warning-triangle" />}
                title="The content couldn't be loaded"
                description="The server didn't answer in time. Your changes are not affected."
                actions={
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<Icon name="refresh" />}
                        onClick={() => scenarioSetting.store("default")}
                    >
                        Try again
                    </Button>
                }
            />
        );
    }
    return children;
}
