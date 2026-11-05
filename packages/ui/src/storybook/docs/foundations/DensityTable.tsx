import { clsx } from "clsx";
import { useLayoutEffect, useRef, useState } from "react";

import { Theme } from "../../../components/theme/Theme";
import type { ThemeDensity } from "../../../theme/types";
import { brandSetting } from "../../brand";
import { useAppliedColorScheme } from "../../colorScheme";
import { densitySetting } from "../../density";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

const densities: { density: ThemeDensity; title: string }[] = [
    { density: "comfortable", title: "Comfortable" },
    { density: "standard", title: "Standard" },
    { density: "compact", title: "Compact" },
];

const rows = [
    { token: "--dextinity-density-field-height", element: "Input" },
    { token: "--dextinity-density-control-height", element: "Button" },
    { token: "--dextinity-density-icon-button-size", element: "Icon button" },
    { token: "--dextinity-density-table-row-height", element: "Table row" },
    { token: "--dextinity-density-tree-row-height", element: "Tree row" },
    { token: "--dextinity-density-nav-item-height", element: "Navigation" },
    { token: "--dextinity-density-form-gap", element: "Form gap" },
];

/**
 * The density metrics of every level side by side, read live from the tokens; the level picked in the toolbar is highlighted.
 */
export function DensityTable() {
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const currentDensity = densitySetting.useValue();
    const probeRefs = useRef<Partial<Record<ThemeDensity, HTMLSpanElement | null>>>({});
    const [values, setValues] = useState<Partial<Record<ThemeDensity, Record<string, string>>>>({});

    useLayoutEffect(() => {
        const resolved: Partial<Record<ThemeDensity, Record<string, string>>> = {};
        for (const { density } of densities) {
            const probe = probeRefs.current[density];
            if (probe) {
                const style = getComputedStyle(probe);
                resolved[density] = Object.fromEntries(rows.map(({ token }) => [token, style.getPropertyValue(token).trim()]));
            }
        }
        setValues(resolved);
    }, [colorScheme, brand]);

    return (
        <DocsDemo>
            {densities.map(({ density }) => (
                <Theme key={density} colorScheme={colorScheme} brand={brand} density={density}>
                    <span
                        hidden
                        ref={(element) => {
                            probeRefs.current[density] = element;
                        }}
                    />
                </Theme>
            ))}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Element</th>
                        {densities.map(({ density, title }) => (
                            <th key={density} className={clsx(density === currentDensity && styles.current)}>
                                {title}
                            </th>
                        ))}
                        <th>Token</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ token, element }) => (
                        <tr key={token}>
                            <td>{element}</td>
                            {densities.map(({ density }) => (
                                <td key={density} className={clsx(styles.numeric, density === currentDensity && styles.current)}>
                                    {values[density]?.[token]}
                                </td>
                            ))}
                            <td>
                                <code>{token}</code>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DocsDemo>
    );
}
