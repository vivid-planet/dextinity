import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { Menu } from "../../components/menu/Menu";
import { MenuRadioGroup } from "../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../components/menu/MenuRadioItem";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting } from "../scenario";
import styles from "./CompareCanvas.module.scss";
import { findElementByPath, getElementPath } from "./frameElements";

export type CompareMode = "viewports" | "variants";

const variantSettings = [
    { key: "colorScheme", setting: colorSchemeSetting, label: "Color scheme" },
    { key: "brand", setting: brandSetting, label: "Theme" },
    { key: "density", setting: densitySetting, label: "Density" },
    { key: "scenario", setting: scenarioSetting, label: "Content" },
] as const;

type VariantKey = (typeof variantSettings)[number]["key"];

/** The settings a variant sets for itself; the others follow the toolbar. */
type Variant = Partial<Record<VariantKey, string>>;

interface CompareFrame {
    id: string;
    label: string;
    width: number;
    height: number;
    variant?: Variant;
}

const viewportFrames: CompareFrame[] = [
    { id: "phone", label: "Phone", width: 390, height: 844 },
    { id: "tablet", label: "Tablet", width: 834, height: 1112 },
    { id: "desktop", label: "Desktop", width: 1440, height: 900 },
];

const variantsStorageKey = "dextinity-ui-workspace-variants";
const defaultVariants: Variant[] = [{}, { colorScheme: "dark" }];
const variantNames = ["A", "B"];
const frameGap = 32;
const labelHeight = 36;

function readVariants(): Variant[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(variantsStorageKey) ?? "null");
        return Array.isArray(stored) && stored.length === defaultVariants.length ? (stored as Variant[]) : defaultVariants;
    } catch {
        return defaultVariants;
    }
}

function getFrameSrc(storyUrl: string, page: string, variant: Variant = {}) {
    const params = variantSettings
        .filter(({ key }) => variant[key] != null)
        .map(({ key, setting }) => `&${setting.storageKey}=${encodeURIComponent(variant[key] ?? "")}`)
        .join("");
    return `${storyUrl}${params}${page ? `#${page}` : ""}`;
}

/** The element a frame scrolls in: the document, or a scroll container of the page, e.g. the main area of an app layout. */
function getScrollElement(target: EventTarget | null, frameDocument: Document) {
    // The frame's elements come from its own window, so `instanceof Element` of the workspace's window doesn't match them
    const node = target as Node | null;
    return node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : frameDocument.scrollingElement;
}

function scrollRatio(element: Element) {
    const top = element.scrollHeight - element.clientHeight;
    return top > 0 ? element.scrollTop / top : 0;
}

/**
 * Follows the page and scrolling of one frame in the others: a click in the navigation of any frame opens the page in all of them,
 * scrolling any of them scrolls the others to the same share of their length.
 */
function useFrameSync(frames: Array<HTMLIFrameElement | null>, loadCount: number, onPageChange: (page: string) => void) {
    const onPageChangeRef = useRef(onPageChange);
    onPageChangeRef.current = onPageChange;

    useEffect(() => {
        const windows = frames.map((frame) => frame?.contentWindow).filter((frameWindow): frameWindow is Window => frameWindow != null);
        // Setting the others' hash and scroll position fires their events too, which mustn't be sent back
        let syncingUntil = 0;
        const cleanups = windows.map((frameWindow) => {
            const frameDocument = frameWindow.document;

            function handleHashChange() {
                const page = frameWindow.location.hash.slice(1);
                onPageChangeRef.current(page);
                for (const other of windows) {
                    if (other !== frameWindow && other.location.hash.slice(1) !== page) {
                        other.location.hash = page;
                    }
                }
            }

            function handleScroll(event: Event) {
                if (performance.now() < syncingUntil) {
                    return;
                }
                const source = getScrollElement(event.target, frameDocument);
                if (!source) {
                    return;
                }
                const ratio = scrollRatio(source);
                const path = source === frameDocument.scrollingElement ? null : getElementPath(source);
                syncingUntil = performance.now() + 80;
                for (const other of windows) {
                    if (other === frameWindow) {
                        continue;
                    }
                    const target = path ? findElementByPath(other.document, path) : other.document.scrollingElement;
                    if (target) {
                        target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
                    }
                }
            }

            frameWindow.addEventListener("hashchange", handleHashChange);
            frameDocument.addEventListener("scroll", handleScroll, { capture: true, passive: true });
            return () => {
                frameWindow.removeEventListener("hashchange", handleHashChange);
                frameDocument.removeEventListener("scroll", handleScroll, { capture: true });
            };
        });
        return () => cleanups.forEach((cleanup) => cleanup());
        // The frames' windows change when they load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadCount, frames.length]);
}

function VariantSetting({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: ReadonlyArray<{ value: string; title: string }>;
    value?: string;
    onChange: (value?: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const current = options.find((option) => option.value === value);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-start"
            trigger={
                <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    endIcon={<Icon name="chevron-down" />}
                    aria-label={`${label}: ${current?.title ?? "As in the toolbar"}`}
                >
                    {current?.title ?? label}
                </Button>
            }
        >
            <MenuRadioGroup aria-label={label} value={value ?? ""} onChange={(newValue) => onChange(newValue === "" ? undefined : String(newValue))}>
                <MenuRadioItem value="" label="As in the toolbar" />
                {options.map((option) => (
                    <MenuRadioItem key={option.value} value={option.value} label={option.title} />
                ))}
            </MenuRadioGroup>
        </Menu>
    );
}

/**
 * The prototype in several frames side by side: at the sizes of a phone, a tablet, and a desktop, or as two variants with their own
 * theme, color scheme, density, or content. All frames show the same page and scroll together.
 */
export function CompareCanvas({
    mode,
    storyUrl,
    startPage,
    density,
    reloadKey,
    onPageChange,
}: {
    mode: CompareMode;
    storyUrl: string;
    startPage: string;
    /** The toolbar's density, which the workspace sets on the frame's document since the prototypes don't read it themselves. */
    density: string;
    reloadKey: number;
    onPageChange: (page: string) => void;
}) {
    const [variants, setVariants] = useState(readVariants);
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [loadCount, setLoadCount] = useState(0);
    const frameRefs = useRef<Array<HTMLIFrameElement | null>>([]);
    // A variant's frame reloads when its settings change, and opens on the page the frames show by then
    const pageRef = useRef(startPage);

    const frames: CompareFrame[] =
        mode === "viewports"
            ? viewportFrames
            : variants.map((variant, index) => ({
                  id: variantNames[index],
                  label: `Variant ${variantNames[index]}`,
                  width: 1440,
                  height: 900,
                  variant,
              }));

    useLayoutEffect(() => {
        if (!canvasElement) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
        observer.observe(canvasElement);
        return () => observer.disconnect();
    }, [canvasElement]);

    useEffect(() => {
        try {
            localStorage.setItem(variantsStorageKey, JSON.stringify(variants));
        } catch {
            // Without storage, the variants start from the defaults on the next load
        }
    }, [variants]);

    useFrameSync(frameRefs.current.slice(0, frames.length), loadCount, (page) => {
        pageRef.current = page;
        onPageChange(page);
    });

    useEffect(() => {
        if (startPage === pageRef.current) {
            return;
        }
        pageRef.current = startPage;
        for (const frame of frameRefs.current.slice(0, frames.length)) {
            if (frame?.contentWindow) {
                frame.contentWindow.location.hash = startPage;
            }
        }
        // Only a page opened from outside the frames, e.g. in the prototypes panel, is sent to them
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startPage]);

    function applyDensity(frame: CompareFrame, element: HTMLIFrameElement | null) {
        const root = element?.contentDocument?.documentElement;
        if (root) {
            root.dataset.dextinityDensity = frame.variant?.density ?? density;
        }
    }

    useEffect(() => {
        frames.forEach((frame, index) => applyDensity(frame, frameRefs.current[index]));
    });

    // One scale for all frames, so that their sizes compare as they are
    const gaps = frameGap * (frames.length - 1);
    const framesWidth = frames.reduce((sum, frame) => sum + frame.width, 0);
    const maxHeight = Math.max(...frames.map((frame) => frame.height));
    const scale = Math.max(0.1, Math.min(1, (canvasSize.width - gaps) / framesWidth, (canvasSize.height - labelHeight) / maxHeight));

    function changeVariant(index: number, key: VariantKey, value?: string) {
        setVariants((current) => current.map((variant, variantIndex) => (variantIndex === index ? { ...variant, [key]: value } : variant)));
    }

    return (
        <div ref={setCanvasElement} className={styles.canvas}>
            <div className={styles.frames} style={{ gap: frameGap }}>
                {frames.map((frame, index) => (
                    <div key={frame.id} className={styles.item} style={{ width: frame.width * scale }}>
                        <div className={styles.label}>
                            <span className={styles.name}>{frame.label}</span>
                            {frame.variant ? (
                                <span className={styles.variantSettings}>
                                    {variantSettings.map(({ key, setting, label }) => (
                                        <VariantSetting
                                            key={key}
                                            label={label}
                                            options={setting.options}
                                            value={frame.variant?.[key]}
                                            onChange={(value) => changeVariant(index, key, value)}
                                        />
                                    ))}
                                </span>
                            ) : (
                                <span>
                                    {frame.width} × {frame.height} · {Math.round(scale * 100)} %
                                </span>
                            )}
                        </div>
                        <div className={styles.sheet} style={{ height: frame.height * scale }}>
                            <div className={styles.frame} style={{ width: frame.width, height: frame.height, transform: `scale(${scale})` }}>
                                <iframe
                                    key={`${getFrameSrc(storyUrl, "", frame.variant)}-${reloadKey}`}
                                    ref={(element) => {
                                        frameRefs.current[index] = element;
                                    }}
                                    className={styles.iframe}
                                    src={getFrameSrc(storyUrl, pageRef.current, frame.variant)}
                                    title={frame.label}
                                    onLoad={(event) => {
                                        applyDensity(frame, event.currentTarget);
                                        setLoadCount((count) => count + 1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
