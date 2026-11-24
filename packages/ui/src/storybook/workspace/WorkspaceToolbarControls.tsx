import { type ReactNode, useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Menu } from "../../components/menu/Menu";
import { MenuRadioGroup } from "../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../components/menu/MenuRadioItem";
import { NumberInput } from "../../components/numberInput/NumberInput";
import { Popover } from "../../components/popover/Popover";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import type { ThemeColorScheme, ThemeDensity } from "../../theme/types";
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

export const zoomOptions: { value: WorkspaceZoom; label: string }[] = [
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

export const densityOptions: { value: ThemeDensity; icon: ReactNode; "aria-label": string }[] = [
    { value: "comfortable", icon: <Icon name="density-comfortable" />, "aria-label": "Comfortable" },
    { value: "standard", icon: <Icon name="density-standard" />, "aria-label": "Standard" },
    { value: "compact", icon: <Icon name="density-compact" />, "aria-label": "Compact" },
];

/** The preset the frame size matches, if any. */
function getViewportPreset(width: number, height: number) {
    return viewportPresets.find((preset) => preset.width === width && preset.height === height);
}

/**
 * The frame size and zoom behind one button, whose tooltip names the current size: presets, the exact size, rotating, and zoom.
 */
export function ViewportControl({
    responsive,
    onResponsiveChange,
    width,
    height,
    zoom,
    onSizeChange,
    onZoomChange,
    disabled,
    showLabel,
}: {
    responsive: boolean;
    onResponsiveChange: () => void;
    width: number;
    height: number;
    zoom: WorkspaceZoom;
    onSizeChange: (size: { width?: number; height?: number }) => void;
    onZoomChange: (zoom: WorkspaceZoom) => void;
    disabled?: boolean;
    /** Names the setting and its current size on the button, where there's room, e.g. in the middle of the bar. */
    showLabel?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const activePreset = responsive ? undefined : getViewportPreset(width, height);
    const triggerLabel = responsive ? "Responsive" : (activePreset?.label ?? "Custom");

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="Viewport"
            placement={showLabel ? "bottom-start" : "bottom-end"}
            trigger={
                showLabel ? (
                    <Button
                        variant="text"
                        color="secondary"
                        size="small"
                        disabled={disabled}
                        startIcon={<Icon name={activePreset?.icon ?? "devices"} />}
                        endIcon={<Icon name="chevron-down" />}
                    >
                        Viewport: {responsive ? "Responsive" : `${triggerLabel} ${width} × ${height}`}
                    </Button>
                ) : (
                    <IconButton
                        variant="text"
                        color="secondary"
                        disabled={disabled}
                        aria-label={responsive ? "Viewport · Responsive" : `Viewport · ${triggerLabel}, ${width} × ${height}`}
                    >
                        <Icon name={activePreset?.icon ?? "devices"} />
                    </IconButton>
                )
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

interface SettingOption<Value extends string> {
    value: Value;
    icon: ReactNode;
    "aria-label": string;
    /** The option on a labeled button, where the full name is too long. */
    shortLabel?: string;
}

/**
 * One setting of the canvas behind a button that shows its current option, e.g. the color scheme. The tooltip names the setting
 * and the option, the menu offers all options.
 */
export function SettingMenu<Value extends string>({
    label,
    icon,
    options,
    value,
    onChange,
    showLabel,
}: {
    label: string;
    /** Shown on the button instead of the current option's icon, for options without icons of their own. */
    icon?: ReactNode;
    options: ReadonlyArray<SettingOption<Value>>;
    value: Value;
    onChange: (value: Value) => void;
    /** Names the setting and its current option on the button, where there's room, e.g. in the middle of the bar. */
    showLabel?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const current = options.find((option) => option.value === value);

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement={showLabel ? "bottom-start" : "bottom-end"}
            trigger={
                showLabel ? (
                    <Button variant="text" color="secondary" size="small" startIcon={icon ?? current?.icon} endIcon={<Icon name="chevron-down" />}>
                        {label}: {current?.shortLabel ?? current?.["aria-label"] ?? value}
                    </Button>
                ) : (
                    <IconButton variant="text" color="secondary" aria-label={`${label} · ${current?.["aria-label"] ?? value}`}>
                        {icon ?? current?.icon}
                    </IconButton>
                )
            }
        >
            <MenuRadioGroup aria-label={label} value={value} onChange={(newValue) => onChange(newValue as Value)}>
                {options.map((option) => (
                    <MenuRadioItem key={option.value} value={option.value} label={option["aria-label"]} icon={option.icon} />
                ))}
            </MenuRadioGroup>
        </Menu>
    );
}
