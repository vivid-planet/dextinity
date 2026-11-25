import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

import { composite, contrastRatio, getBackgroundBehind, toRgba } from "./frameColor";
import { type FrameRect, getFrameRect, useFrameDocument } from "./frameElements";
import { CommentLayer, HotspotLayer, type NotePage, TextLayer } from "./FrameNotes";
import { createTokenLookup } from "./frameTokens";
import styles from "./FrameTools.module.scss";
import { toolAttribute } from "./hotspots";

export type FrameTool = "measure" | "accessibility" | "comment" | "text" | "hotspot";

// The frame's elements come from another window, so `instanceof Element` of this one doesn't recognize them
function asElement(target: EventTarget | null): Element | null {
    return target != null && (target as Node).nodeType === Node.ELEMENT_NODE ? (target as Element) : null;
}

/** Changes whenever the frame's page may have moved: it scrolled, resized, or its content changed. */
function useFrameTick(frameDocument: Document | null) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const frameWindow = frameDocument?.defaultView;
        if (!frameDocument || !frameWindow) {
            return;
        }
        let scheduled = 0;
        const schedule = () => {
            if (!scheduled) {
                scheduled = frameWindow.requestAnimationFrame(() => {
                    scheduled = 0;
                    setTick((value) => value + 1);
                });
            }
        };
        const observer = new MutationObserver(schedule);
        observer.observe(frameDocument.body, { subtree: true, childList: true, attributes: true, characterData: true });
        frameDocument.addEventListener("scroll", schedule, { capture: true, passive: true });
        frameWindow.addEventListener("resize", schedule);
        return () => {
            observer.disconnect();
            frameDocument.removeEventListener("scroll", schedule, { capture: true });
            frameWindow.removeEventListener("resize", schedule);
            frameWindow.cancelAnimationFrame(scheduled);
        };
    }, [frameDocument]);
    return tick;
}

function scaled(rect: FrameRect, scale: number) {
    return { top: rect.top * scale, left: rect.left * scale, width: rect.width * scale, height: rect.height * scale };
}

function round(value: number) {
    return Math.round(value * 10) / 10;
}

interface Distance {
    orientation: "horizontal" | "vertical";
    /** The line's start and length in frame pixels, and where it crosses. */
    start: number;
    length: number;
    at: number;
}

function contains(outer: FrameRect, inner: FrameRect) {
    return (
        inner.left >= outer.left &&
        inner.top >= outer.top &&
        inner.left + inner.width <= outer.left + outer.width &&
        inner.top + inner.height <= outer.top + outer.height
    );
}

/** The gaps between two boxes, or the insets of one inside the other, as a designer measures them. */
function getDistances(a: FrameRect, b: FrameRect): Distance[] {
    const [outer, inner] = contains(a, b) ? [a, b] : contains(b, a) ? [b, a] : [null, null];
    if (outer && inner) {
        const centerX = inner.left + inner.width / 2;
        const centerY = inner.top + inner.height / 2;
        return [
            { orientation: "vertical" as const, start: outer.top, length: inner.top - outer.top, at: centerX },
            {
                orientation: "vertical" as const,
                start: inner.top + inner.height,
                length: outer.top + outer.height - inner.top - inner.height,
                at: centerX,
            },
            { orientation: "horizontal" as const, start: outer.left, length: inner.left - outer.left, at: centerY },
            {
                orientation: "horizontal" as const,
                start: inner.left + inner.width,
                length: outer.left + outer.width - inner.left - inner.width,
                at: centerY,
            },
        ].filter((distance) => distance.length > 0.5);
    }
    const distances: Distance[] = [];
    const [left, right] = a.left <= b.left ? [a, b] : [b, a];
    if (left.left + left.width <= right.left) {
        const overlapTop = Math.max(a.top, b.top);
        const overlapBottom = Math.min(a.top + a.height, b.top + b.height);
        const at = overlapBottom > overlapTop ? (overlapTop + overlapBottom) / 2 : a.top + a.height / 2;
        distances.push({ orientation: "horizontal", start: left.left + left.width, length: right.left - left.left - left.width, at });
    }
    const [upper, lower] = a.top <= b.top ? [a, b] : [b, a];
    if (upper.top + upper.height <= lower.top) {
        const overlapLeft = Math.max(a.left, b.left);
        const overlapRight = Math.min(a.left + a.width, b.left + b.width);
        const at = overlapRight > overlapLeft ? (overlapLeft + overlapRight) / 2 : a.left + a.width / 2;
        distances.push({ orientation: "vertical", start: upper.top + upper.height, length: lower.top - upper.top - upper.height, at });
    }
    return distances;
}

function describeElement(element: Element) {
    const className = typeof element.className === "string" ? element.className.split(" ")[0]?.replace(/^_?([A-Za-z]+?)_.*$/, "$1") : "";
    return `${element.tagName.toLowerCase()}${className ? `.${className}` : ""}`;
}

interface Measurement {
    label: string;
    value: string;
    token?: string;
}

const spacingToken = /space|spacing|gap|padding|margin/;

function measure(element: Element): Measurement[] {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    if (!style) {
        return [];
    }
    const tokens = createTokenLookup(element);
    const lengths = (value: string, prefer: RegExp) =>
        value
            .split(" ")
            .map((part) => {
                const token = tokens.length(part, prefer);
                return token ? `${part} (${token})` : part;
            })
            .join(" ");
    const rows: Measurement[] = [];
    const sides = (property: "padding" | "margin") => {
        const values = ["top", "right", "bottom", "left"].map((side) => style.getPropertyValue(`${property}-${side}`));
        if (values.every((value) => value === "0px")) {
            return;
        }
        const [top, right, bottom, left] = values;
        const short = top === bottom && right === left ? (top === right ? top : `${top} ${right}`) : values.join(" ");
        rows.push({ label: property === "padding" ? "Padding" : "Margin", value: lengths(short, spacingToken) });
    };
    sides("padding");
    sides("margin");
    if (style.display.includes("flex") || style.display.includes("grid")) {
        const gap = style.rowGap === style.columnGap ? style.rowGap : `${style.rowGap} ${style.columnGap}`;
        if (gap !== "normal" && gap !== "0px") {
            rows.push({ label: "Gap", value: lengths(gap, spacingToken) });
        }
    }
    if (style.borderTopLeftRadius !== "0px") {
        rows.push({ label: "Radius", value: lengths(style.borderTopLeftRadius, /radius/) });
    }
    const hasText = Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (hasText) {
        rows.push({
            label: "Font",
            value: `${style.fontSize} / ${style.lineHeight} · ${style.fontWeight}`,
            token: tokens.length(style.fontSize, /font-size|typography.*size|text.*size/),
        });
        rows.push({ label: "Text", value: style.color, token: tokens.color(style.color, /text|foreground/) });
    }
    const background = toRgba(style.backgroundColor);
    if (background && background[3] > 0) {
        rows.push({
            label: "Background",
            value: style.backgroundColor,
            token: tokens.color(style.backgroundColor, /surface|background|canvas|fill|bg/),
        });
    }
    if (style.borderTopStyle !== "none" && style.borderTopWidth !== "0px") {
        rows.push({
            label: "Border",
            value: `${style.borderTopWidth} ${style.borderTopColor}`,
            token: tokens.color(style.borderTopColor, /line|border/),
        });
    }
    return rows;
}

// Swallowed while measuring, so pointing at the page doesn't also press its buttons or open its menus
const blockedEvents = ["click", "pointerdown", "mousedown", "pointerup", "mouseup", "dblclick", "contextmenu"] as const;

/**
 * Measures the page in the frame: the element under the pointer shows its size, a click selects it and lists its spacing,
 * font, and colors with the matching theme tokens, and pointing at another element then shows the distances between both.
 */
function MeasureLayer({ frameDocument, scale, onExit }: { frameDocument: Document; scale: number; onExit: () => void }) {
    const [hovered, setHovered] = useState<Element | null>(null);
    const [selected, setSelected] = useState<Element | null>(null);
    const exitRef = useRef(onExit);
    exitRef.current = onExit;

    useEffect(() => {
        const block = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const handleMove = (event: MouseEvent) => setHovered(asElement(event.target));
        const handleClick = (event: MouseEvent) => {
            block(event);
            const element = asElement(event.target);
            setSelected((current) => (current === element ? null : element));
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelected((current) => {
                    if (!current) {
                        exitRef.current();
                    }
                    return null;
                });
            }
        };
        const handleLeave = () => setHovered(null);
        frameDocument.addEventListener("mousemove", handleMove, true);
        frameDocument.documentElement.addEventListener("mouseleave", handleLeave);
        for (const type of blockedEvents) {
            frameDocument.addEventListener(type, type === "click" ? handleClick : block, true);
        }
        // In the workspace itself, Escape belongs to an open menu or a field first
        const handleWorkspaceKey = (event: KeyboardEvent) => {
            const target = event.target as Element | null;
            if (
                !event.defaultPrevented &&
                !target?.closest?.('input, textarea, [contenteditable], [role="menu"], [role="dialog"], [role="listbox"]')
            ) {
                handleKey(event);
            }
        };
        frameDocument.addEventListener("keydown", handleKey, true);
        window.addEventListener("keydown", handleWorkspaceKey);
        frameDocument.documentElement.dataset.workspaceMeasuring = "";
        return () => {
            frameDocument.removeEventListener("mousemove", handleMove, true);
            frameDocument.documentElement.removeEventListener("mouseleave", handleLeave);
            for (const type of blockedEvents) {
                frameDocument.removeEventListener(type, type === "click" ? handleClick : block, true);
            }
            frameDocument.removeEventListener("keydown", handleKey, true);
            window.removeEventListener("keydown", handleWorkspaceKey);
            delete frameDocument.documentElement.dataset.workspaceMeasuring;
        };
    }, [frameDocument]);

    const selectedRect = selected?.isConnected ? getFrameRect(selected) : null;
    const hoveredRect = hovered?.isConnected && hovered !== selected ? getFrameRect(hovered) : null;
    const distances = selectedRect && hoveredRect ? getDistances(selectedRect, hoveredRect) : [];
    // Not measured again on each change of the page: the token lookup adds a probe to the page, which is a change itself
    const measurements = useMemo(() => (selected ? measure(selected) : []), [selected]);

    return (
        <>
            <div className={styles.layer}>
                {selectedRect && (
                    <div className={styles.selectedBox} style={scaled(selectedRect, scale)}>
                        <span className={styles.size}>
                            {round(selectedRect.width)} × {round(selectedRect.height)}
                        </span>
                    </div>
                )}
                {hoveredRect && (
                    <div className={styles.hoveredBox} style={scaled(hoveredRect, scale)}>
                        {!selectedRect && (
                            <span className={styles.size}>
                                {round(hoveredRect.width)} × {round(hoveredRect.height)}
                            </span>
                        )}
                    </div>
                )}
                {distances.map((distance) => (
                    <div
                        key={`${distance.orientation}-${distance.start}`}
                        className={styles.distance}
                        data-orientation={distance.orientation}
                        style={
                            distance.orientation === "horizontal"
                                ? { left: distance.start * scale, width: distance.length * scale, top: distance.at * scale }
                                : { top: distance.start * scale, height: distance.length * scale, left: distance.at * scale }
                        }
                    >
                        <span className={styles.distanceLabel}>{round(distance.length)}</span>
                    </div>
                ))}
            </div>
            <aside className={styles.card} aria-label="Measurements">
                {selected ? (
                    <>
                        <p className={styles.cardTitle}>
                            <code>{describeElement(selected)}</code>
                            {selectedRect && (
                                <span>
                                    {round(selectedRect.width)} × {round(selectedRect.height)}
                                </span>
                            )}
                        </p>
                        <dl className={styles.rows}>
                            {measurements.map((row) => (
                                <div key={row.label} className={styles.row}>
                                    <dt>{row.label}</dt>
                                    <dd>
                                        {row.value}
                                        {row.token && <span className={styles.token}>{row.token}</span>}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <p className={styles.hint}>Point at another element for the distance. Escape clears.</p>
                    </>
                ) : (
                    <p className={styles.hint}>Click an element to measure it. Escape ends measuring.</p>
                )}
            </aside>
        </>
    );
}

const focusableSelector = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"], [contenteditable=""]';
const targetSelector = `${focusableSelector}, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"]`;
const minTargetSize = 24;

// The element, not its box: the check runs once the page has settled, the boxes follow scrolling on every frame
interface Finding {
    key: string;
    element: Element;
    label: string;
}

function isShown(element: Element, viewport: { width: number; height: number }) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.right < 0 || rect.top > viewport.height || rect.left > viewport.width) {
        return false;
    }
    return "checkVisibility" in element ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
}

// Hidden from people, e.g. the native input behind a styled checkbox, so nobody has to hit it
function isHiddenFromUsers(element: Element) {
    const rect = element.getBoundingClientRect();
    return (
        element.closest('[aria-hidden="true"], [inert]') != null ||
        (element.tagName === "INPUT" && (element as HTMLInputElement).type === "hidden") ||
        rect.width <= 1 ||
        rect.height <= 1
    );
}

function isRendered(element: Element) {
    return "checkVisibility" in element ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
}

function isDisabled(element: Element) {
    return element.matches(":disabled") || element.getAttribute("aria-disabled") === "true";
}

function checkAccessibility(frameDocument: Document) {
    const frameWindow = frameDocument.defaultView;
    const viewport = { width: frameWindow?.innerWidth ?? 0, height: frameWindow?.innerHeight ?? 0 };
    // Numbered among the elements Tab can reach at all, then shown where they're in view
    const focusables = Array.from(frameDocument.body.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.tabIndex >= 0 && !isDisabled(element) && !isHiddenFromUsers(element) && isRendered(element),
    );
    // Positive tab indexes come first, in their order, then the document's order
    const ordered = [
        ...focusables.filter((element) => element.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex),
        ...focusables.filter((element) => element.tabIndex === 0),
    ];
    const tabOrder: Finding[] = ordered
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => isShown(element, viewport))
        .map(({ element, index }) => ({ key: `tab-${index}`, element, label: String(index + 1) }));

    const smallTargets: Finding[] = Array.from(frameDocument.body.querySelectorAll(targetSelector))
        // WCAG exempts links inside a sentence, whose size the line of text sets
        .filter(
            (element) =>
                !isDisabled(element) &&
                !isHiddenFromUsers(element) &&
                isShown(element, viewport) &&
                frameWindow?.getComputedStyle(element).display !== "inline",
        )
        .map((element) => ({ element, rect: getFrameRect(element) }))
        .filter(({ rect }) => rect.width < minTargetSize || rect.height < minTargetSize)
        .map(({ element, rect }, index) => ({ key: `target-${index}`, element, label: `${round(rect.width)} × ${round(rect.height)}` }));

    const lowContrast: Finding[] = [];
    let unchecked = 0;
    for (const element of Array.from(frameDocument.body.querySelectorAll("*"))) {
        const hasText = Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (!hasText || !isShown(element, viewport)) {
            continue;
        }
        const style = frameWindow?.getComputedStyle(element);
        const background = getBackgroundBehind(element);
        const text = style && toRgba(style.color);
        if (!style || !text) {
            continue;
        }
        if (!background) {
            unchecked++;
            continue;
        }
        // A faded element or ancestor fades its text too
        let opacity = 1;
        for (let current: Element | null = element; current; current = current.parentElement) {
            opacity *= Number(frameWindow?.getComputedStyle(current).opacity ?? 1);
        }
        const ratio = contrastRatio(composite([text[0], text[1], text[2], text[3] * opacity], background), background);
        const fontSize = parseFloat(style.fontSize);
        const large = fontSize >= 24 || (fontSize >= 18.66 && Number(style.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) {
            lowContrast.push({ key: `contrast-${lowContrast.length}`, element, label: `${ratio.toFixed(1)}:1` });
        }
    }
    return { tabOrder, smallTargets, lowContrast, unchecked };
}

type AccessibilityCheck = "tabOrder" | "smallTargets" | "lowContrast";

const checks: Array<{ key: AccessibilityCheck; label: string; description: string }> = [
    { key: "tabOrder", label: "Tab order", description: "The order Tab moves through the page" },
    { key: "smallTargets", label: "Small targets", description: `Controls smaller than ${minTargetSize} × ${minTargetSize} pixels` },
    { key: "lowContrast", label: "Low contrast", description: "Text below 4.5:1, large text below 3:1" },
];

/**
 * Checks the visible part of the page: the tab order, controls too small to hit, and text with too little contrast. The page stays
 * usable, so tabbing through it shows the order in action.
 */
function AccessibilityLayer({ frameDocument, scale, tick }: { frameDocument: Document; scale: number; tick: number }) {
    const [shown, setShown] = useState<AccessibilityCheck[]>(["tabOrder", "smallTargets", "lowContrast"]);
    const [checked, setChecked] = useState(() => ({ result: checkAccessibility(frameDocument), at: performance.now() }));
    // Checked again once the page has settled after a change or scrolling, not on every frame of it, but at least every second
    // while it keeps changing, e.g. during an animation
    useEffect(() => {
        const check = () => setChecked({ result: checkAccessibility(frameDocument), at: performance.now() });
        if (performance.now() - checked.at > 1000) {
            check();
        }
        const timeout = window.setTimeout(check, 200);
        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `checked.at` is read, not followed
    }, [frameDocument, tick]);
    // Elements the page removed since the check have no place to mark
    const result = {
        ...checked.result,
        tabOrder: checked.result.tabOrder.filter((finding) => finding.element.isConnected),
        smallTargets: checked.result.smallTargets.filter((finding) => finding.element.isConnected),
        lowContrast: checked.result.lowContrast.filter((finding) => finding.element.isConnected),
    };

    return (
        <>
            <div className={styles.layer}>
                {shown.includes("lowContrast") &&
                    result.lowContrast.map((finding) => (
                        <div
                            key={finding.key}
                            className={styles.finding}
                            data-check="lowContrast"
                            style={scaled(getFrameRect(finding.element), scale)}
                        >
                            <span className={styles.findingLabel}>{finding.label}</span>
                        </div>
                    ))}
                {shown.includes("smallTargets") &&
                    result.smallTargets.map((finding) => (
                        <div
                            key={finding.key}
                            className={styles.finding}
                            data-check="smallTargets"
                            style={scaled(getFrameRect(finding.element), scale)}
                        >
                            <span className={styles.findingLabel}>{finding.label}</span>
                        </div>
                    ))}
                {shown.includes("tabOrder") &&
                    result.tabOrder.map((finding) => (
                        <span
                            key={finding.key}
                            className={styles.tabBadge}
                            style={{ top: getFrameRect(finding.element).top * scale, left: getFrameRect(finding.element).left * scale }}
                        >
                            {finding.label}
                        </span>
                    ))}
            </div>
            <aside className={styles.card} aria-label="Accessibility check">
                <p className={styles.cardTitle}>Accessibility · visible area</p>
                <ul className={styles.checks}>
                    {checks.map((check) => (
                        <li key={check.key}>
                            <label className={styles.check} data-check={check.key} title={check.description}>
                                <input
                                    type="checkbox"
                                    checked={shown.includes(check.key)}
                                    onChange={(event) =>
                                        setShown((current) =>
                                            event.target.checked ? [...current, check.key] : current.filter((key) => key !== check.key),
                                        )
                                    }
                                />
                                <span className={styles.swatch} />
                                {check.label}
                                <strong>{result[check.key].length}</strong>
                            </label>
                        </li>
                    ))}
                </ul>
                {result.unchecked > 0 && (
                    <p className={styles.hint}>{result.unchecked} texts on images or gradients aren&apos;t checked for contrast.</p>
                )}
            </aside>
        </>
    );
}

/** Draws the active tool over the frame; `scale` maps the frame's pixels to the canvas. */
export function FrameTools({
    tool,
    frameRef,
    frameLoadCount,
    scale,
    notePage,
    onExit,
}: {
    tool: FrameTool;
    notePage: NotePage;
    frameRef: RefObject<HTMLIFrameElement | null>;
    frameLoadCount: number;
    scale: number;
    onExit: () => void;
}) {
    const frameDocument = useFrameDocument(frameRef, frameLoadCount);
    const tick = useFrameTick(frameDocument);
    useEffect(() => {
        frameDocument?.documentElement.setAttribute(toolAttribute, tool);
        return () => frameDocument?.documentElement.removeAttribute(toolAttribute);
    }, [frameDocument, tool]);
    if (!frameDocument?.body) {
        return null;
    }
    switch (tool) {
        case "measure":
            return <MeasureLayer frameDocument={frameDocument} scale={scale} onExit={onExit} />;
        case "accessibility":
            return <AccessibilityLayer frameDocument={frameDocument} scale={scale} tick={tick} />;
        case "comment":
            return <CommentLayer frameDocument={frameDocument} scale={scale} notePage={notePage} />;
        case "text":
            return <TextLayer frameDocument={frameDocument} notePage={notePage} />;
        case "hotspot":
            return <HotspotLayer frameDocument={frameDocument} scale={scale} notePage={notePage} />;
    }
}
