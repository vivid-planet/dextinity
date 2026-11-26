import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { Popover } from "../../components/popover/Popover";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Tabs } from "../../components/tabs/Tabs";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting } from "../scenario";
import { textLengthSetting } from "../textLength";
import { tokenOverrideList } from "./tokenPlayground";
import { TokenSliders } from "./TokenSliders";
import styles from "./WorkspaceToolbarControls.module.scss";

const viewSettings = [
    { key: "brand", label: "Theme", setting: brandSetting },
    { key: "colorScheme", label: "Color scheme", setting: colorSchemeSetting },
    { key: "density", label: "Density", setting: densitySetting },
    { key: "scenario", label: "Content", setting: scenarioSetting },
    { key: "textLength", label: "Text length", setting: textLengthSetting },
] as const;

type ViewKey = (typeof viewSettings)[number]["key"];
type ViewTab = "settings" | "tokens";

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

/** How the prototype is shown: its theme, color scheme, density, content, and text length, and the theme's tokens. */
export function ViewMenu() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<ViewTab>("settings");
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
            <Tabs
                aria-label="View"
                className={styles.viewBody}
                value={tab}
                onChange={setTab}
                items={[
                    {
                        value: "settings",
                        label: "Settings",
                        panel: (
                            <div className={styles.viewPanel}>
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
                            </div>
                        ),
                    },
                    {
                        value: "tokens",
                        label: "Tokens",
                        panel: (
                            <div className={styles.viewPanel}>
                                <TokenSliders brand={brand} />
                            </div>
                        ),
                    },
                ]}
            />
        </Popover>
    );
}
