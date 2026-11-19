import { type ReactNode, useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Menu } from "../../components/menu/Menu";
import { MenuItem } from "../../components/menu/MenuItem";
import { NumberInput } from "../../components/numberInput/NumberInput";
import { Popover } from "../../components/popover/Popover";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Select } from "../../components/select/Select";
import type { ThemeColorScheme, ThemeDensity } from "../../theme/types";
import { brandSetting } from "../brand";
import type { WorkspaceZoom } from "./workspaceState";
import styles from "./WorkspaceToolbarControls.module.scss";

export const minFrameSize = 280;

// The widths sit on both sides of the app shell's breakpoints at 768px and 1280px
const viewportPresets = [
    { value: "desktop-large", label: "Desktop large", icon: "device-desktop", width: 1920, height: 1080 },
    { value: "desktop", label: "Desktop", icon: "device-desktop", width: 1440, height: 900 },
    { value: "laptop", label: "Laptop", icon: "device-desktop", width: 1280, height: 800 },
    { value: "laptop-small", label: "Small laptop", icon: "device-desktop", width: 1024, height: 768 },
    { value: "tablet", label: "Tablet", icon: "device-tablet", width: 768, height: 1024 },
    { value: "phone", label: "Phone", icon: "device-phone", width: 390, height: 844 },
] as const;

const zoomOptions: { value: WorkspaceZoom; label: string }[] = [
    { value: "fit", label: "Fit" },
    { value: "0.5", label: "50 %" },
    { value: "0.75", label: "75 %" },
    { value: "1", label: "100 %" },
    { value: "1.5", label: "150 %" },
];

export const colorSchemeOptions: { value: ThemeColorScheme; icon: ReactNode; "aria-label": string }[] = [
    { value: "light", icon: <Icon name="sun" />, "aria-label": "Light" },
    { value: "dark", icon: <Icon name="moon" />, "aria-label": "Dark" },
    { value: "high-contrast", icon: <Icon name="contrast" />, "aria-label": "High contrast" },
];

const densityOptions: { value: ThemeDensity; icon: ReactNode; "aria-label": string }[] = [
    { value: "comfortable", icon: <Icon name="density-comfortable" />, "aria-label": "Comfortable" },
    { value: "standard", icon: <Icon name="density-standard" />, "aria-label": "Standard" },
    { value: "compact", icon: <Icon name="density-compact" />, "aria-label": "Compact" },
];

/** The preset the frame size matches, if any. */
export function getViewportPreset(width: number, height: number) {
    return viewportPresets.find((preset) => preset.width === width && preset.height === height);
}

/**
 * The frame size and zoom behind one button that shows the current size: presets, the exact size, rotating, and zoom.
 */
export function ViewportControl({
    responsive,
    onResponsiveChange,
    width,
    height,
    zoom,
    onSizeChange,
    onZoomChange,
}: {
    responsive: boolean;
    onResponsiveChange: () => void;
    width: number;
    height: number;
    zoom: WorkspaceZoom;
    onSizeChange: (size: { width?: number; height?: number }) => void;
    onZoomChange: (zoom: WorkspaceZoom) => void;
}) {
    const [open, setOpen] = useState(false);
    const activePreset = responsive ? undefined : getViewportPreset(width, height);
    const triggerLabel = responsive ? "Responsive" : (activePreset?.label ?? "Custom");

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="Viewport"
            placement="bottom-start"
            trigger={
                <Button
                    variant="text"
                    color="secondary"
                    aria-label={responsive ? "Viewport: Responsive" : `Viewport: ${triggerLabel}, ${width} × ${height}`}
                    startIcon={<Icon name={activePreset?.icon ?? "devices"} />}
                    endIcon={<Icon name="chevron-down" />}
                >
                    <span className={styles.viewportText}>
                        {responsive ? (
                            <span>Responsive</span>
                        ) : (
                            <>
                                <span className={styles.viewportName}>{triggerLabel}</span>
                                <span className={styles.viewportSize}>
                                    {width} × {height}
                                </span>
                            </>
                        )}
                    </span>
                </Button>
            }
        >
            <div className={styles.popoverBody}>
                <div className={styles.presets} role="group" aria-label="Presets">
                    <button type="button" className={styles.preset} aria-pressed={responsive} onClick={onResponsiveChange}>
                        <Icon name="devices" />
                        <span className={styles.presetLabel}>Responsive</span>
                        <span className={styles.presetSize}>Fills the window</span>
                    </button>
                    {viewportPresets.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            className={styles.preset}
                            aria-pressed={preset.value === activePreset?.value}
                            onClick={() => onSizeChange({ width: preset.width, height: preset.height })}
                        >
                            <Icon name={preset.icon} />
                            <span className={styles.presetLabel}>{preset.label}</span>
                            <span className={styles.presetSize}>
                                {preset.width} × {preset.height}
                            </span>
                        </button>
                    ))}
                </div>
                <div className={styles.sizeRow}>
                    <Field label="Width" className={styles.sizeField}>
                        <NumberInput
                            min={minFrameSize}
                            steppers={false}
                            value={width}
                            onChange={(value) => value && onSizeChange({ width: value })}
                        />
                    </Field>
                    <Field label="Height" className={styles.sizeField}>
                        <NumberInput
                            min={minFrameSize}
                            steppers={false}
                            value={height}
                            onChange={(value) => value && onSizeChange({ height: value })}
                        />
                    </Field>
                    <IconButton
                        variant="outlined"
                        color="secondary"
                        aria-label="Rotate: swap width and height"
                        onClick={() => onSizeChange({ width: height, height: width })}
                    >
                        <Icon name="swap" />
                    </IconButton>
                </div>
                {!responsive && (
                    <Field label="Zoom" layout="group">
                        <SegmentedControl size="small" options={zoomOptions} value={zoom} onChange={onZoomChange} />
                    </Field>
                )}
            </div>
        </Popover>
    );
}

/**
 * The look of the page in the canvas: the brand, the color scheme, and the density.
 */
export function AppearanceControl({
    brand,
    onBrandChange,
    colorScheme,
    onColorSchemeChange,
    density,
    onDensityChange,
}: {
    brand: string;
    onBrandChange: (brand: string) => void;
    colorScheme: ThemeColorScheme;
    onColorSchemeChange: (colorScheme: ThemeColorScheme) => void;
    density: ThemeDensity;
    onDensityChange: (density: ThemeDensity) => void;
}) {
    const [open, setOpen] = useState(false);
    const brandTitle = brandSetting.options.find((option) => option.value === brand)?.title ?? brand;
    const colorSchemeTitle = colorSchemeOptions.find((option) => option.value === colorScheme)?.["aria-label"] ?? colorScheme;
    const densityTitle = densityOptions.find((option) => option.value === density)?.["aria-label"] ?? density;

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="Appearance"
            placement="bottom-end"
            trigger={
                <IconButton variant="text" color="secondary" aria-label={`Appearance: ${brandTitle} theme, ${densityTitle} density`}>
                    <Icon name="tune" />
                </IconButton>
            }
        >
            <div className={styles.popoverBody}>
                <Field label="Theme">
                    <Select
                        name="brand"
                        options={brandSetting.options.map(({ value, title }) => ({ value, label: title }))}
                        value={brand}
                        onChange={(value) => value && onBrandChange(value)}
                    />
                </Field>
                <Field label={`Color scheme · ${colorSchemeTitle}`} layout="group">
                    <SegmentedControl size="small" options={colorSchemeOptions} value={colorScheme} onChange={onColorSchemeChange} />
                </Field>
                <Field label={`Density · ${densityTitle}`} layout="group">
                    <SegmentedControl size="small" options={densityOptions} value={density} onChange={onDensityChange} />
                </Field>
            </div>
        </Popover>
    );
}

/**
 * The actions needed now and then: reloading the story, and opening it on its own.
 */
export function MoreActionsMenu({ onReload, storyUrl }: { onReload: () => void; storyUrl: string | null }) {
    const [open, setOpen] = useState(false);

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton variant="text" color="secondary" aria-label="More actions">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem label="Reload story" icon={<Icon name="refresh" />} onClick={onReload} />
            <MenuItem
                label="Open story in a new tab"
                icon={<Icon name="external-link" />}
                disabled={!storyUrl}
                onClick={() => storyUrl && window.open(storyUrl, "_blank")}
            />
        </Menu>
    );
}
