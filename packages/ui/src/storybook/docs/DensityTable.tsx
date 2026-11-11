import { clsx } from "clsx";
import { useLayoutEffect, useRef, useState } from "react";

import { Theme } from "../../components/theme/Theme";
import type { ThemeDensity } from "../../theme/types";
import { useToolbarBrand } from "../brand";
import { useToolbarColorScheme } from "../colorScheme";
import { useToolbarDensity } from "../density";
import { ToolbarTheme } from "../themeDecorator";
import styles from "./TokenTable.module.scss";

const densities: Array<{ density: ThemeDensity; title: string }> = [
    { density: "comfortable", title: "Comfortable" },
    { density: "standard", title: "Standard" },
    { density: "compact", title: "Compact" },
];

export interface DensityTableProps {
    /** The rows: what the token sizes, and the token. */
    rows: Array<{ element: string; token: string }>;
}

/**
 * Compares density tokens across the three densities, and highlights the density picked in the toolbar.
 */
export function DensityTable({ rows }: DensityTableProps) {
    const probeRefs = useRef<Partial<Record<ThemeDensity, HTMLSpanElement | null>>>({});
    const [values, setValues] = useState<Partial<Record<ThemeDensity, Record<string, string>>>>({});
    const toolbarDensity = useToolbarDensity();
    const brand = useToolbarBrand();
    const colorScheme = useToolbarColorScheme();
    const tokensKey = rows.map((row) => row.token).join(",");

    useLayoutEffect(() => {
        setValues(
            Object.fromEntries(
                densities.map(({ density }) => {
                    const probe = probeRefs.current[density];
                    const style = probe ? getComputedStyle(probe) : undefined;
                    return [density, Object.fromEntries(tokensKey.split(",").map((token) => [token, style?.getPropertyValue(token).trim() ?? ""]))];
                }),
            ),
        );
    }, [tokensKey, brand, colorScheme]);

    return (
        <ToolbarTheme>
            <div className={styles.root}>
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
                            <th>CSS variable</th>
                            {densities.map(({ density, title }) => (
                                <th key={density} className={clsx(density === toolbarDensity && styles.highlighted)}>
                                    {title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.token}>
                                <td>{row.element}</td>
                                <td>
                                    <code>{row.token}</code>
                                </td>
                                {densities.map(({ density }) => (
                                    <td key={density} className={clsx(density === toolbarDensity && styles.highlighted)}>
                                        <code>{values[density]?.[row.token]}</code>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ToolbarTheme>
    );
}
