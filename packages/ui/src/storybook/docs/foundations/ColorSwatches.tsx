import { clsx } from "clsx";
import type { CSSProperties } from "react";

import { contrastGrade, contrastRatio, parseColor } from "./contrast";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";
import { useResolvedColors } from "./useComputedTokens";

type ColorSwatch = {
    /** The custom property, e.g. `--dextinity-color-text`. */
    token: string;
    name: string;
    usage: string;
    /**
     * `fill` paints the token as background, `text` as "Aa" on canvas, `glass` over the light field, `gradient` as background image.
     *
     * @defaultValue `"fill"`
     */
    kind?: "fill" | "text" | "glass" | "gradient";
    /** Backgrounds to compute the WCAG contrast of this (text) color against. */
    contrast?: { background: string; label: string }[];
};

export interface ColorSwatchesProps {
    swatches: ColorSwatch[];
}

const canvasToken = "--dextinity-color-canvas";
const gradeLabels = { AAA: "AAA", AA: "AA", "AA large": "AA large", fail: "too low" };

function formatColor(color: string) {
    return color.replace(/(\d\.\d{3})\d+/g, "$1");
}

/**
 * Swatches of semantic color tokens with their live value and, for text colors, their contrast against the given backgrounds — all
 * computed in the brand and color scheme picked in the toolbar.
 */
export function ColorSwatches({ swatches }: ColorSwatchesProps) {
    const tokens = new Set([canvasToken]);
    for (const swatch of swatches) {
        tokens.add(swatch.token);
        swatch.contrast?.forEach(({ background }) => tokens.add(background));
    }
    const { colors, probe } = useResolvedColors([...tokens]);
    const canvas = colors[canvasToken] ? parseColor(colors[canvasToken]) : null;

    return (
        <DocsDemo>
            {probe}
            <div className={styles.swatchGrid}>
                {swatches.map(({ token, name, usage, kind = "fill", contrast = [] }) => {
                    const color = colors[token];
                    const foreground = color ? parseColor(color) : null;
                    return (
                        <div key={token} className={styles.swatch}>
                            <div
                                className={clsx(styles.swatchSample, kind === "glass" && styles.onLightField)}
                                data-kind={kind}
                                style={
                                    {
                                        "--swatch-color": `var(${token})`,
                                        "--swatch-background": `var(${contrast[0]?.background ?? canvasToken})`,
                                    } as CSSProperties
                                }
                            >
                                {kind === "text" && <span>Aa</span>}
                            </div>
                            <div className={styles.swatchMeta}>
                                <b>{name}</b>
                                <code>{token}</code>
                                {kind !== "gradient" && color && <code className={styles.swatchValue}>{formatColor(color)}</code>}
                                <span>{usage}</span>
                                {contrast.map(({ background, label }) => {
                                    const backgroundColor = colors[background] ? parseColor(colors[background]) : null;
                                    if (!foreground || !backgroundColor || !canvas) {
                                        return null;
                                    }
                                    const ratio = contrastRatio(foreground, backgroundColor, canvas);
                                    const grade = contrastGrade(ratio);
                                    return (
                                        <span key={background} className={styles.contrast} data-grade={grade}>
                                            <i>{label}</i>
                                            <em>
                                                {ratio.toFixed(1)} : 1 · {gradeLabels[grade]}
                                            </em>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DocsDemo>
    );
}
