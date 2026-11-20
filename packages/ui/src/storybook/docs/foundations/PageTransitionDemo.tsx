import { useState } from "react";

import { Button } from "../../../components/button/Button";
import { Switch } from "../../../components/switch/Switch";
import { Typography } from "../../../components/typography/Typography";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

export type PageTransitionKind = "forward" | "back" | "lateral" | "panelForward" | "panelBack" | "context";

export const pageTransitionKinds: { kind: PageTransitionKind; title: string; when: string }[] = [
    { kind: "forward", title: "Forward", when: "Deeper into the hierarchy, e.g. list → edit. With a shared element (row → title)." },
    { kind: "back", title: "Back", when: "One level up; the scroll position comes back." },
    { kind: "lateral", title: "Lateral", when: "Same level, e.g. tabs or navigating between areas. The direction follows the order." },
    { kind: "panelForward", title: "Panel deeper", when: "Into a nested block inside the edit panel." },
    { kind: "panelBack", title: "Panel up", when: "Back through the panel's breadcrumbs." },
    { kind: "context", title: "Context", when: "Scope, language, density, theme: the content changes, the place stays — crossfade only." },
];

const viewTitles = ["Overview", "Page tree", "Edit", "Block", "Nested block", "Assets"];

type View = { id: number; number: number; phase: "enter" | "exit" | "idle" };

/**
 * Plays the page transition of each kind on a sample view. The shell stays put; only the content moves.
 */
export function PageTransitionDemo() {
    const [kind, setKind] = useState<PageTransitionKind>("forward");
    const [views, setViews] = useState<View[]>([{ id: 0, number: 1, phase: "idle" }]);
    const [reducedMotion, setReducedMotion] = useState(false);

    function play(nextKind: PageTransitionKind) {
        setKind(nextKind);
        setViews((current) => {
            const visible = current[current.length - 1];
            const goesUp = nextKind === "back" || nextKind === "panelBack";
            const number = goesUp ? Math.max(1, visible.number - 1) : visible.number + 1;
            return [
                { ...visible, phase: "exit" },
                { id: visible.id + 1, number, phase: "enter" },
            ];
        });
    }

    return (
        <DocsDemo>
            <div className={styles.motionControls}>
                {pageTransitionKinds.map((transition) => (
                    <Button key={transition.kind} variant="outlined" color="secondary" size="small" onClick={() => play(transition.kind)}>
                        {transition.title}
                    </Button>
                ))}
                <Switch checked={reducedMotion} onChange={setReducedMotion} size="small">
                    Reduce motion
                </Switch>
            </div>
            <div className={styles.motionStage} data-kind={kind} data-reduced-motion={reducedMotion || undefined} aria-live="polite">
                {views.map((view) => (
                    <div
                        key={view.id}
                        className={styles.motionView}
                        data-phase={view.phase}
                        aria-hidden={view.phase === "exit" || undefined}
                        onAnimationEnd={() => {
                            if (view.phase === "enter") {
                                setViews([{ ...view, phase: "idle" }]);
                            }
                        }}
                    >
                        <Typography variant="label">View</Typography>
                        <Typography variant="displayL" element="span">
                            {view.number}
                        </Typography>
                        <span>{viewTitles[(view.number - 1) % viewTitles.length]}</span>
                    </div>
                ))}
            </div>
        </DocsDemo>
    );
}
