import { useState } from "react";

import { Field } from "../../../components/field/Field";
import { Icon } from "../../../components/icon/Icon";
import { Panel } from "../../../components/panel/Panel";
import { SegmentedControl } from "../../../components/segmentedControl/SegmentedControl";
import styles from "./SegmentedControlStyles.module.scss";

const variants = [
    { id: "current", className: undefined, name: "Current", description: "Gray track with an outline, the selected option raised in white." },
    {
        id: "softGray",
        className: styles.softGray,
        name: "Soft gray",
        description: "A lighter track without an outline; only the raised option stands out.",
    },
    {
        id: "outlineAccent",
        className: styles.outlineAccent,
        name: "Outline, soft accent",
        description: "No fill, an outline around the options; the selected one gets the soft accent.",
    },
    {
        id: "accentFill",
        className: styles.accentFill,
        name: "Accent fill",
        description: "White track with an outline; the selected option is filled with the accent.",
    },
    { id: "ink", className: styles.ink, name: "Ink", description: "No fill, an outline; the selected option in the text color, like a pressed key." },
    {
        id: "separate",
        className: styles.separate,
        name: "Separate buttons",
        description: "No track; each option looks like a small outlined button, the selected one in the soft accent.",
    },
];

function VariantFields() {
    const [focalPoint, setFocalPoint] = useState("auto");
    const [crop, setCrop] = useState("free");
    const [view, setView] = useState("grid");
    return (
        <>
            <Field label="Focal point" layout="group">
                <SegmentedControl
                    value={focalPoint}
                    onChange={setFocalPoint}
                    options={[
                        { value: "auto", label: "Automatic" },
                        { value: "manual", label: "Manual" },
                    ]}
                />
            </Field>
            <Field label="Crop" layout="group">
                <SegmentedControl
                    value={crop}
                    onChange={setCrop}
                    options={[
                        { value: "free", label: "Free" },
                        { value: "16:9", label: "16:9" },
                        { value: "4:3", label: "4:3" },
                        { value: "1:1", label: "1:1" },
                    ]}
                />
            </Field>
            <Field label="View" layout="group">
                <SegmentedControl
                    size="small"
                    value={view}
                    onChange={setView}
                    options={[
                        { value: "grid", icon: <Icon name="grid" />, "aria-label": "Tiles" },
                        { value: "list", icon: <Icon name="list" />, "aria-label": "List" },
                    ]}
                />
            </Field>
        </>
    );
}

/**
 * Proposals for the look of `SegmentedControl` in the light themes, side by side with the current one. They change only the
 * control's tokens, so the dark and high-contrast themes follow; switch them in the toolbar to compare.
 */
export function SegmentedControlStyles() {
    return (
        <div className={styles.page}>
            {variants.map((variant) => (
                <Panel key={variant.id} className={variant.className}>
                    <div className={styles.variant}>
                        <div>
                            <h2 className={styles.name}>{variant.name}</h2>
                            <p className={styles.description}>{variant.description}</p>
                        </div>
                        <VariantFields />
                    </div>
                </Panel>
            ))}
        </div>
    );
}
