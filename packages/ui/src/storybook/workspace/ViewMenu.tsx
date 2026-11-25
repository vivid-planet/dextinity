import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { Popover } from "../../components/popover/Popover";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting } from "../scenario";
import { textLengthSetting } from "../textLength";
import { type TokenOverride, tokenOverrideList } from "./tokenPlayground";
import { TokenSliders } from "./TokenSliders";
import { createStoredList } from "./workspaceNotes";
import styles from "./WorkspaceToolbarControls.module.scss";

const viewSettings = [
    { key: "scenario", label: "Content", setting: scenarioSetting },
    { key: "textLength", label: "Text length", setting: textLengthSetting },
    { key: "colorScheme", label: "Color scheme", setting: colorSchemeSetting },
    { key: "brand", label: "Theme", setting: brandSetting },
    { key: "density", label: "Density", setting: densitySetting },
] as const;

type ViewKey = (typeof viewSettings)[number]["key"];

/** A combination of view settings to switch to at once; the settings it leaves out go back to their defaults. */
interface ViewPreset {
    id: string;
    name: string;
    values: Partial<Record<ViewKey, string>>;
    tokens?: TokenOverride[];
}

const builtInPresets: ViewPreset[] = [
    { id: "default", name: "Default", values: {} },
    { id: "stress", name: "Stress test", values: { colorScheme: "dark", density: "compact", textLength: "longest", scenario: "many" } },
    { id: "first-use", name: "First use", values: { scenario: "empty" } },
    { id: "trouble", name: "Something went wrong", values: { scenario: "error" } },
];

const savedPresetList = createStoredList<ViewPreset>("dextinity-ui-workspace-view-presets");

function readCurrentView(): ViewPreset["values"] {
    return Object.fromEntries(
        viewSettings.filter(({ setting }) => setting.get() !== setting.defaultValue).map(({ key, setting }) => [key, setting.get()]),
    );
}

function applyPreset(preset: ViewPreset) {
    for (const { key, setting } of viewSettings) {
        setting.store(preset.values[key] ?? setting.defaultValue);
    }
    tokenOverrideList.set(preset.tokens ?? []);
}

function useViewValues(): Record<ViewKey, string> {
    return {
        scenario: scenarioSetting.useValue(),
        textLength: textLengthSetting.useValue(),
        colorScheme: colorSchemeSetting.useValue(),
        brand: brandSetting.useValue(),
        density: densitySetting.useValue(),
    };
}

/** Whether the prototype is shown other than by default, for the dot on the menu's button. */
function useViewChanged() {
    const values = useViewValues();
    const tokens = tokenOverrideList.useItems();
    return tokens.length > 0 || viewSettings.some(({ key, setting }) => values[key] !== setting.defaultValue);
}

/**
 * How the prototype is shown: its content, text length, color scheme, theme, density, and tokens. They're used together, so they're
 * in one place, with presets to switch several at once.
 */
export function ViewMenu() {
    const [open, setOpen] = useState(false);
    const [presetName, setPresetName] = useState("");
    const savedPresets = savedPresetList.useItems();
    const changed = useViewChanged();
    const values = useViewValues();
    const brand = brandSetting.useValue();

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="View"
            placement="bottom-end"
            trigger={
                <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    startIcon={<Icon name="layers" />}
                    aria-label={changed ? "View · changed from the default" : "View"}
                >
                    View
                    {changed && <span className={styles.changedDot} aria-hidden />}
                </Button>
            }
        >
            <div className={styles.viewBody}>
                <Field label="Presets" layout="group">
                    <div className={styles.viewPresets}>
                        {[...builtInPresets, ...savedPresets].map((preset) => (
                            <span key={preset.id} className={styles.presetChip}>
                                <Button variant="outlined" color="secondary" size="small" onClick={() => applyPreset(preset)}>
                                    {preset.name}
                                </Button>
                                {savedPresets.includes(preset) && (
                                    <button
                                        type="button"
                                        className={styles.presetRemove}
                                        aria-label={`Remove preset “${preset.name}”`}
                                        onClick={() => savedPresetList.update((items) => items.filter((item) => item.id !== preset.id))}
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                </Field>
                <form
                    className={styles.savePreset}
                    onSubmit={(event) => {
                        event.preventDefault();
                        const name = presetName.trim();
                        if (name) {
                            savedPresetList.update((items) => [
                                ...items,
                                { id: crypto.randomUUID(), name, values: readCurrentView(), tokens: tokenOverrideList.get() },
                            ]);
                            setPresetName("");
                        }
                    }}
                >
                    <input
                        className={styles.presetInput}
                        aria-label="Name of a new preset"
                        placeholder="Save the current view as …"
                        value={presetName}
                        onChange={(event) => setPresetName(event.target.value)}
                    />
                    <Button type="submit" variant="outlined" color="secondary" size="small" disabled={presetName.trim() === ""}>
                        Save
                    </Button>
                </form>
                {viewSettings.map(({ key, label, setting }) => (
                    <Field key={key} label={label} layout="group">
                        <SegmentedControl
                            size="small"
                            options={setting.options.map(({ value, title }) => ({ value, label: title }))}
                            value={values[key]}
                            onChange={(value) => setting.store(value)}
                        />
                    </Field>
                ))}
                <p className={styles.viewSection}>Tokens</p>
                <TokenSliders brand={brand} />
            </div>
        </Popover>
    );
}
