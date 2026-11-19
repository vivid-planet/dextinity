import { type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Input } from "../../components/input/Input";
import { NumberInput } from "../../components/numberInput/NumberInput";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Select } from "../../components/select/Select";
import { Theme } from "../../components/theme/Theme";
import type { ThemeColorScheme, ThemeDensity } from "../../theme/types";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import styles from "./WorkspaceShell.module.scss";
import { useWorkspaceState, type WorkspaceZoom } from "./workspaceState";

const shellStoryId = "workspace-shell--shell";
const minFrameSize = 280;
const canvasPadding = 48;

// The widths sit on both sides of the app shell's breakpoints at 768px and 1280px
const viewportPresets = [
    { value: "desktop-large", label: "Desktop large · 1920", width: 1920, height: 1080 },
    { value: "desktop", label: "Desktop · 1440", width: 1440, height: 900 },
    { value: "laptop", label: "Laptop · 1280", width: 1280, height: 800 },
    { value: "laptop-small", label: "Small laptop · 1024", width: 1024, height: 768 },
    { value: "tablet", label: "Tablet · 768", width: 768, height: 1024 },
    { value: "phone", label: "Phone · 390", width: 390, height: 844 },
];

const zoomOptions: { value: WorkspaceZoom; label: string }[] = [
    { value: "fit", label: "Fit" },
    { value: "0.5", label: "50 %" },
    { value: "0.75", label: "75 %" },
    { value: "1", label: "100 %" },
    { value: "1.5", label: "150 %" },
];

const colorSchemeOptions: { value: ThemeColorScheme; icon: ReactNode; "aria-label": string }[] = [
    { value: "light", icon: <Icon name="sun" />, "aria-label": "Light" },
    { value: "dark", icon: <Icon name="moon" />, "aria-label": "Dark" },
    { value: "high-contrast", icon: <Icon name="contrast" />, "aria-label": "High contrast" },
];

const densityOptions: { value: ThemeDensity; icon: ReactNode; "aria-label": string }[] = [
    { value: "comfortable", icon: <Icon name="density-comfortable" />, "aria-label": "Comfortable" },
    { value: "standard", icon: <Icon name="density-standard" />, "aria-label": "Standard" },
    { value: "compact", icon: <Icon name="density-compact" />, "aria-label": "Compact" },
];

interface IndexedStory {
    id: string;
    title: string;
    name: string;
}

interface StoryIndex {
    entries: Record<string, { id: string; title: string; name: string; type: string; tags?: string[] }>;
}

async function fetchStories(): Promise<IndexedStory[]> {
    const response = await fetch(new URL("index.json", document.baseURI));
    const index: StoryIndex = await response.json();
    return Object.values(index.entries)
        .filter((entry) => entry.type === "story" && entry.id !== shellStoryId && !entry.tags?.includes("development"))
        .map(({ id, title, name }) => ({ id, title, name }))
        .sort((a, b) => Number(b.title.startsWith("Workspace/")) - Number(a.title.startsWith("Workspace/")));
}

function groupByTitle(stories: IndexedStory[]) {
    const groups = new Map<string, IndexedStory[]>();
    for (const story of stories) {
        groups.set(story.title, [...(groups.get(story.title) ?? []), story]);
    }
    return [...groups.entries()];
}

function getInitialColorScheme(): ThemeColorScheme {
    const stored = colorSchemeSetting.get();
    return stored === "system" ? "light" : stored;
}

function useElementSize(element: HTMLElement | null) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        if (!element) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);
    return size;
}

type ResizeEdge = "inline" | "block" | "both";

/**
 * A design workspace: the stories of the Storybook in a frame that behaves like a browser window, with the theme, color scheme,
 * density, and viewport size switchable around it. The shell itself always keeps the same look.
 */
export function WorkspaceShell() {
    const [state, updateState] = useWorkspaceState();
    const [stories, setStories] = useState<IndexedStory[]>([]);
    const [search, setSearch] = useState("");
    const [colorScheme, setColorScheme] = useState(getInitialColorScheme);
    const [brand, setBrand] = useState(brandSetting.get);
    const [density, setDensity] = useState(densitySetting.get);
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [resizing, setResizing] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const canvasSize = useElementSize(canvasElement);

    useEffect(() => {
        void fetchStories().then(setStories);
    }, []);

    const storyId = state.storyId ?? stories.find((story) => story.title.startsWith("Workspace/"))?.id ?? stories[0]?.id ?? null;
    const currentStory = stories.find((story) => story.id === storyId);

    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matches = query ? stories.filter((story) => `${story.title} ${story.name}`.toLowerCase().includes(query)) : stories;
        return groupByTitle(matches);
    }, [stories, search]);

    function applyDensityToFrame() {
        const frameDocument = frameRef.current?.contentDocument;
        if (frameDocument) {
            frameDocument.documentElement.dataset.dextinityDensity = density;
        }
    }

    useEffect(applyDensityToFrame);

    const fitScale = Math.min(1, (canvasSize.width - canvasPadding * 2) / state.width, (canvasSize.height - canvasPadding * 2) / state.height);
    const scale = state.zoom === "fit" ? Math.max(fitScale, 0.1) : Number(state.zoom);
    const activePreset = viewportPresets.find((preset) => preset.width === state.width && preset.height === state.height);
    const storyUrl = storyId ? `iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story` : null;

    function startResize(edge: ResizeEdge, event: ReactPointerEvent<HTMLDivElement>) {
        event.preventDefault();
        const start = { x: event.clientX, y: event.clientY, width: state.width, height: state.height };
        setResizing(true);

        function handleMove(moveEvent: PointerEvent) {
            const changes: { width?: number; height?: number } = {};
            if (edge !== "block") {
                changes.width = Math.max(minFrameSize, Math.round(start.width + (moveEvent.clientX - start.x) / scale));
            }
            if (edge !== "inline") {
                changes.height = Math.max(minFrameSize, Math.round(start.height + (moveEvent.clientY - start.y) / scale));
            }
            updateState(changes);
        }

        function handleUp() {
            setResizing(false);
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        }

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
    }

    return (
        <Theme colorScheme="light" brand="dextinity" density="compact" className={styles.themeRoot}>
            <div className={styles.root} data-resizing={resizing || undefined}>
                <header className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                        <IconButton
                            variant="text"
                            color="secondary"
                            aria-label={state.panelOpen ? "Hide stories" : "Show stories"}
                            onClick={() => updateState({ panelOpen: !state.panelOpen })}
                        >
                            <Icon name={state.panelOpen ? "sidebar-close" : "sidebar-open"} />
                        </IconButton>
                        <div className={styles.heading}>
                            <span className={styles.headingTitle}>Workspace</span>
                            <span className={styles.headingStory}>{currentStory ? `${currentStory.title} · ${currentStory.name}` : "…"}</span>
                        </div>
                    </div>

                    <div className={styles.toolbarGroup}>
                        <Select
                            name="viewport"
                            aria-label="Viewport"
                            className={styles.viewportSelect}
                            placeholder={`Custom · ${state.width}`}
                            options={viewportPresets.map(({ value, label }) => ({ value, label }))}
                            value={activePreset?.value ?? null}
                            onChange={(value) => {
                                const preset = viewportPresets.find((candidate) => candidate.value === value);
                                if (preset) {
                                    updateState({ width: preset.width, height: preset.height });
                                }
                            }}
                        />
                        <NumberInput
                            aria-label="Width"
                            className={styles.sizeInput}
                            min={minFrameSize}
                            steppers={false}
                            value={state.width}
                            onChange={(width) => width && updateState({ width })}
                        />
                        <span className={styles.times}>×</span>
                        <NumberInput
                            aria-label="Height"
                            className={styles.sizeInput}
                            min={minFrameSize}
                            steppers={false}
                            value={state.height}
                            onChange={(height) => height && updateState({ height })}
                        />
                        <IconButton
                            variant="text"
                            color="secondary"
                            aria-label="Swap width and height"
                            onClick={() => updateState({ width: state.height, height: state.width })}
                        >
                            <Icon name="swap" />
                        </IconButton>
                        <Select
                            name="zoom"
                            aria-label="Zoom"
                            className={styles.zoomSelect}
                            options={zoomOptions}
                            value={state.zoom}
                            onChange={(zoom) => zoom && updateState({ zoom })}
                        />
                    </div>

                    <div className={styles.toolbarGroup}>
                        <Select
                            name="brand"
                            aria-label="Theme"
                            className={styles.brandSelect}
                            options={brandSetting.options.map(({ value, title }) => ({ value, label: title }))}
                            value={brand}
                            onChange={(value) => {
                                if (value) {
                                    brandSetting.store(value);
                                    setBrand(brandSetting.get());
                                }
                            }}
                        />
                        <SegmentedControl
                            size="small"
                            aria-label="Color scheme"
                            options={colorSchemeOptions}
                            value={colorScheme}
                            onChange={(value) => {
                                colorSchemeSetting.store(value);
                                setColorScheme(value);
                            }}
                        />
                        <SegmentedControl
                            size="small"
                            aria-label="Density"
                            options={densityOptions}
                            value={density}
                            onChange={(value) => {
                                densitySetting.store(value);
                                setDensity(value);
                            }}
                        />
                        <IconButton variant="text" color="secondary" aria-label="Reload story" onClick={() => setReloadKey((key) => key + 1)}>
                            <Icon name="refresh" />
                        </IconButton>
                        <IconButton
                            variant="text"
                            color="secondary"
                            aria-label="Open story in a new tab"
                            disabled={!storyUrl}
                            onClick={() => storyUrl && window.open(storyUrl, "_blank")}
                        >
                            <Icon name="external-link" />
                        </IconButton>
                    </div>
                </header>

                <div className={styles.body}>
                    {state.panelOpen && (
                        <nav className={styles.panel} aria-label="Stories">
                            <div className={styles.panelSearch}>
                                <Input
                                    aria-label="Search stories"
                                    placeholder="Search stories"
                                    startAdornment={<Icon name="search" />}
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                            <div className={styles.panelList}>
                                {filteredGroups.map(([title, groupStories]) => (
                                    <section key={title} className={styles.group}>
                                        <h2 className={styles.groupTitle}>{title}</h2>
                                        {groupStories.map((story) => (
                                            <button
                                                key={story.id}
                                                type="button"
                                                className={styles.storyItem}
                                                aria-current={story.id === storyId || undefined}
                                                onClick={() => updateState({ storyId: story.id })}
                                            >
                                                {story.name}
                                            </button>
                                        ))}
                                    </section>
                                ))}
                            </div>
                        </nav>
                    )}

                    <div ref={setCanvasElement} className={styles.canvas}>
                        <div className={styles.stage} style={{ width: state.width * scale, height: state.height * scale }}>
                            <div className={styles.frameLabel}>
                                {activePreset?.label.split(" · ")[0] ?? "Custom"} · {state.width} × {state.height}
                                {state.zoom === "fit" && ` · ${Math.round(scale * 100)} %`}
                            </div>
                            <div className={styles.frame} style={{ width: state.width, height: state.height, transform: `scale(${scale})` }}>
                                {storyUrl && (
                                    <iframe
                                        key={`${storyUrl}-${reloadKey}`}
                                        ref={frameRef}
                                        className={styles.iframe}
                                        src={storyUrl}
                                        title={currentStory ? `${currentStory.title} · ${currentStory.name}` : "Story"}
                                        onLoad={applyDensityToFrame}
                                    />
                                )}
                            </div>
                            <div className={styles.handleInline} onPointerDown={(event) => startResize("inline", event)} />
                            <div className={styles.handleBlock} onPointerDown={(event) => startResize("block", event)} />
                            <div className={styles.handleCorner} onPointerDown={(event) => startResize("both", event)} />
                        </div>
                    </div>
                </div>
            </div>
        </Theme>
    );
}
