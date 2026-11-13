import { type CSSProperties, type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from "react";

import { Button } from "../../../components/button/Button";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { Chip } from "../../../components/chip/Chip";
import { Icon } from "../../../components/icon/Icon";
import { Link } from "../../../components/link/Link";
import { Slider, type SliderProps } from "../../../components/slider/Slider";
import { Switch } from "../../../components/switch/Switch";
import { Theme } from "../../../components/theme/Theme";
import { brandSetting } from "../../brand";
import { useAppliedColorScheme } from "../../colorScheme";
import { densitySetting } from "../../density";
import { useResolvedTokens } from "../ThemedProbe";
import { contrastGrade, contrastRatio, parseColor } from "./contrast";
import { DocsDemo } from "./DocsDemo";
import foundationStyles from "./Foundations.module.scss";
import {
    formatOklch,
    hslToSrgb,
    isInDisplayP3Gamut,
    isInSrgbGamut,
    maxSrgbChroma,
    type Oklch,
    oklchToSrgb,
    parseOklch,
    type Rgb,
    srgbContrast,
    srgbToOklchLightness,
    toHex,
} from "./oklch";
import styles from "./OklchDemos.module.scss";
import { useResolvedColors } from "./useComputedTokens";

const white: Rgb = [1, 1, 1];
const black: Rgb = [0, 0, 0];
const gradeLabels = { AAA: "AAA", AA: "AA", "AA large": "AA large", fail: "too low" };

function cssOklch({ lightness, chroma, hue }: Oklch) {
    return `oklch(${lightness} ${chroma} ${hue})`;
}

/** Black or white, whichever reads better on the background. */
function readableTextColor(background: Rgb) {
    return srgbContrast(background, white) >= srgbContrast(background, black) ? "oklch(1 0 0)" : "oklch(0 0 0)";
}

function hueGradient(lightness: number, chroma: number) {
    return `linear-gradient(90deg in oklch longer hue, oklch(${lightness} ${chroma} 0), oklch(${lightness} ${chroma} 359.9))`;
}

function ContrastLine({ label, ratio }: { label: string; ratio: number }) {
    const grade = contrastGrade(ratio);
    return (
        <span className={foundationStyles.contrast} data-grade={grade}>
            <i>{label}</i>
            <em>
                {ratio.toFixed(2)} : 1 · {gradeLabels[grade]}
            </em>
        </span>
    );
}

function GamutChips({ color }: { color: Oklch }) {
    const inSrgb = isInSrgbGamut(color);
    return (
        <span className={styles.chips}>
            {inSrgb ? (
                <Chip color="success" size="small">
                    Fits sRGB
                </Chip>
            ) : (
                <Chip color="warning" size="small">
                    Too colorful for sRGB – gets clipped
                </Chip>
            )}
            {!inSrgb && (
                <Chip color={isInDisplayP3Gamut(color) ? "info" : "warning"} size="small">
                    {isInDisplayP3Gamut(color) ? "Fits Display P3" : "Outside Display P3 too"}
                </Chip>
            )}
        </span>
    );
}

type AxisSliderProps = Pick<SliderProps, "value" | "onChange" | "min" | "max" | "step"> & {
    label: string;
    formattedValue: string;
    track: string;
};

/** A slider whose track shows the axis it moves along. */
function AxisSlider({ label, formattedValue, track, ...sliderProps }: AxisSliderProps) {
    return (
        <div className={styles.axisSlider}>
            <Slider
                {...sliderProps}
                label={label}
                className={styles.slider}
                slotProps={{
                    track: { className: styles.gradientTrack, style: { background: track } },
                    indicator: { className: styles.gradientIndicator },
                }}
            />
            <output className={styles.axisValue} aria-hidden>
                {formattedValue}
            </output>
        </div>
    );
}

const axes = [
    {
        letter: "L",
        title: "Lightness",
        description: "0 is black, 1 is white. Perceived lightness, not technical brightness.",
        gradient: "linear-gradient(90deg in oklch, oklch(0 0 0), oklch(1 0 0))",
    },
    {
        letter: "C",
        title: "Chroma",
        description: "0 is gray, open-ended upward. In the admin, rarely above 0.25.",
        gradient: "linear-gradient(90deg in oklch, oklch(0.62 0 275), oklch(0.62 0.25 275))",
    },
    {
        letter: "H",
        title: "Hue",
        description: "An angle from 0 to 360°. 25 is about red, 145 green, 275 indigo.",
        gradient: hueGradient(0.7, 0.15),
    },
];

/**
 * The three axes of OKLCH, each with a strip along it.
 */
export function OklchAxes() {
    return (
        <DocsDemo>
            <div className={styles.axes}>
                {axes.map(({ letter, title, description, gradient }) => (
                    <div key={letter} className={styles.axis}>
                        <b className={styles.axisLetter} aria-hidden>
                            {letter}
                        </b>
                        <div className={styles.axisText}>
                            <b>
                                {letter} · {title}
                            </b>
                            <span>{description}</span>
                            <div className={styles.bar} style={{ background: gradient }} />
                        </div>
                    </div>
                ))}
            </div>
        </DocsDemo>
    );
}

const presetTokens = [
    { token: "--dextinity-color-accent", name: "Accent" },
    { token: "--dextinity-color-accent-text", name: "Accent text" },
    { token: "--dextinity-color-success", name: "Success" },
    { token: "--dextinity-color-warning", name: "Warning" },
    { token: "--dextinity-color-danger", name: "Danger" },
];

/**
 * Three sliders for lightness, chroma, and hue, with the resulting color, its hex value, its contrast to white and black, and
 * whether sRGB can show it. Semantic tokens of the toolbar's theme can be loaded as a starting point.
 */
export function OklchPlayground() {
    const [color, setColor] = useState<Oklch>({ lightness: 0.62, chroma: 0.19, hue: 275 });
    const { colors: tokenColors, probe } = useResolvedColors(presetTokens.map(({ token }) => token));

    const rgb = oklchToSrgb(color);
    const contrastToWhite = srgbContrast(rgb, white);
    const contrastToBlack = srgbContrast(rgb, black);
    const srgbLimit = maxSrgbChroma(color.lightness, color.hue);

    return (
        <DocsDemo>
            {probe}
            <div className={styles.playground}>
                <div className={styles.controls}>
                    <AxisSlider
                        label="L · Lightness"
                        value={color.lightness}
                        onChange={(lightness) => setColor({ ...color, lightness })}
                        min={0}
                        max={1}
                        step={0.01}
                        formattedValue={color.lightness.toFixed(2)}
                        track={`linear-gradient(90deg in oklch, oklch(0 ${color.chroma} ${color.hue}), oklch(1 ${color.chroma} ${color.hue}))`}
                    />
                    <AxisSlider
                        label="C · Chroma"
                        value={color.chroma}
                        onChange={(chroma) => setColor({ ...color, chroma })}
                        min={0}
                        max={0.37}
                        step={0.005}
                        formattedValue={color.chroma.toFixed(3)}
                        track={`linear-gradient(90deg in oklch, oklch(${color.lightness} 0 ${color.hue}), oklch(${color.lightness} 0.37 ${color.hue}))`}
                    />
                    <AxisSlider
                        label="H · Hue"
                        value={color.hue}
                        onChange={(hue) => setColor({ ...color, hue })}
                        min={0}
                        max={360}
                        step={1}
                        formattedValue={String(Math.round(color.hue))}
                        track={hueGradient(color.lightness, Math.min(color.chroma, 0.15))}
                    />
                    <div className={styles.presets} role="group" aria-label="Load a token of the current theme">
                        <span className={styles.label}>Load a token</span>
                        {presetTokens.map(({ token, name }) => {
                            const preset = tokenColors[token] ? parseOklch(tokenColors[token]) : null;
                            return (
                                <Button
                                    key={token}
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    disabled={!preset}
                                    onClick={() => preset && setColor({ lightness: preset.lightness, chroma: preset.chroma, hue: preset.hue })}
                                >
                                    {name}
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.result}>
                    <div className={styles.sample} style={{ background: cssOklch(color), color: readableTextColor(rgb) }}>
                        <code>{formatOklch(color)}</code>
                        <b aria-hidden>Aa</b>
                    </div>
                    <dl className={styles.facts}>
                        <Fact label="Hex (sRGB)">
                            <code>{toHex(rgb)}</code>
                        </Fact>
                        <Fact label="Highest chroma sRGB shows here">
                            <code>{srgbLimit.toFixed(3)}</code>
                        </Fact>
                        <Fact label="Contrast">
                            <ContrastLine label="to white" ratio={contrastToWhite} />
                            <ContrastLine label="to black" ratio={contrastToBlack} />
                        </Fact>
                        <Fact label="Color space">
                            <span aria-live="polite">
                                <GamutChips color={color} />
                            </span>
                        </Fact>
                    </dl>
                </div>
            </div>
        </DocsDemo>
    );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className={styles.fact}>
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

const comparisonHues = [
    { hue: 25, hslHue: 0, name: "Red" },
    { hue: 60, hslHue: 30, name: "Orange" },
    { hue: 100, hslHue: 60, name: "Yellow" },
    { hue: 145, hslHue: 120, name: "Green" },
    { hue: 195, hslHue: 180, name: "Turquoise" },
    { hue: 255, hslHue: 220, name: "Blue" },
    { hue: 300, hslHue: 270, name: "Violet" },
    { hue: 340, hslHue: 320, name: "Pink" },
];

/**
 * The same hues at the same nominal lightness in HSL and in OKLCH, with the lightness each one really has, and a gradient
 * interpolated in sRGB next to one interpolated in OKLCH.
 */
export function HslOklchComparison() {
    return (
        <DocsDemo>
            <div className={styles.comparison}>
                <div className={styles.rowLabel}>
                    <b>HSL</b>
                    <code>hsl(h 85% 50%)</code>
                </div>
                <div className={styles.cells}>
                    {comparisonHues.map(({ hslHue, name }) => {
                        const rgb = hslToSrgb(hslHue, 85, 50);
                        return (
                            <div key={name} className={styles.cell} style={{ background: toHex(rgb), color: readableTextColor(rgb) }}>
                                <b>{name}</b>
                                <code>L {srgbToOklchLightness(rgb).toFixed(2)}</code>
                            </div>
                        );
                    })}
                </div>
                <div className={styles.rowLabel}>
                    <b>OKLCH</b>
                    <code>oklch(0.66 0.15 h)</code>
                </div>
                <div className={styles.cells}>
                    {comparisonHues.map(({ hue, name }) => {
                        const color = { lightness: 0.66, chroma: 0.15, hue };
                        return (
                            <div
                                key={name}
                                className={styles.cell}
                                style={{ background: cssOklch(color), color: readableTextColor(oklchToSrgb(color)) }}
                            >
                                <b>{name}</b>
                                <code>L {srgbToOklchLightness(oklchToSrgb(color)).toFixed(2)}</code>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className={styles.gradients}>
                <div>
                    <span className={styles.label}>Gradient in sRGB</span>
                    <div
                        className={styles.largeBar}
                        style={{ background: "linear-gradient(90deg in srgb, oklch(0.55 0.2 265), oklch(0.88 0.17 95))" }}
                    />
                    <span className={styles.note}>Turns gray and muddy in the middle.</span>
                </div>
                <div>
                    <span className={styles.label}>Gradient in OKLCH</span>
                    <div
                        className={styles.largeBar}
                        style={{ background: "linear-gradient(90deg in oklch, oklch(0.55 0.2 265), oklch(0.88 0.17 95))" }}
                    />
                    <span className={styles.note}>Stays colorful, the lightness rises evenly.</span>
                </div>
            </div>
        </DocsDemo>
    );
}

const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const primaryHueToken = "--dextinity-brand-primary-hue";
const primaryChromaToken = "--dextinity-brand-primary-chroma";
const brandProbeTokens = [
    "--dextinity-color-canvas",
    "--dextinity-color-accent",
    "--dextinity-color-accent-foreground",
    "--dextinity-color-accent-text",
    ...scaleSteps.map((step) => `--dextinity-color-primary-${step}`),
];

/**
 * Resolves color tokens to computed colors inside the element of `probeRef`, re-reading them whenever `key` changes.
 */
function useColorsInside(probeRef: RefObject<HTMLSpanElement | null>, tokens: string[], key: string) {
    const [colors, setColors] = useState<Record<string, string>>({});
    const tokensKey = tokens.join(",");
    useLayoutEffect(() => {
        const probe = probeRef.current;
        if (!probe) {
            return;
        }
        const resolved: Record<string, string> = {};
        for (const token of tokensKey.split(",")) {
            probe.style.color = `var(${token})`;
            resolved[token] = getComputedStyle(probe).color;
        }
        setColors(resolved);
    }, [probeRef, tokensKey, key]);
    return colors;
}

/**
 * Moves the brand's primary hue and chroma, the two tokens a brand sets for its accent, and shows how real components, the
 * primary scale, and the contrast of the accent follow in the toolbar's color scheme.
 */
export function BrandHueDemo() {
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const density = densitySetting.useValue();
    const { values: brandValues, probe } = useResolvedTokens([primaryHueToken, primaryChromaToken]);
    const [override, setOverride] = useState<{ hue: number; chroma: number } | null>(null);
    const [isChecked, setIsChecked] = useState(true);
    const probeRef = useRef<HTMLSpanElement>(null);

    const brandHue = Number(brandValues[primaryHueToken]) || 0;
    const brandChroma = Number(brandValues[primaryChromaToken]) || 0;
    const hue = override?.hue ?? brandHue;
    const chroma = override?.chroma ?? brandChroma;
    const colors = useColorsInside(probeRef, brandProbeTokens, [hue, chroma, colorScheme, brand, density].join());

    const parsed = (token: string) => (colors[token] ? parseColor(colors[token]) : null);
    const canvas = parsed("--dextinity-color-canvas");
    const accent = parsed("--dextinity-color-accent");
    const accentForeground = parsed("--dextinity-color-accent-foreground");
    const accentText = parsed("--dextinity-color-accent-text");
    const accentOklch = colors["--dextinity-color-accent"] ? parseOklch(colors["--dextinity-color-accent"]) : null;

    return (
        <DocsDemo>
            {probe}
            <div className={styles.brandControls}>
                <AxisSlider
                    label="Primary hue"
                    value={hue}
                    onChange={(nextHue) => setOverride({ hue: nextHue, chroma })}
                    min={0}
                    max={360}
                    step={1}
                    formattedValue={String(Math.round(hue))}
                    track={hueGradient(0.68, 0.15)}
                />
                <AxisSlider
                    label="Primary chroma"
                    value={chroma}
                    onChange={(nextChroma) => setOverride({ hue, chroma: nextChroma })}
                    min={0}
                    max={0.37}
                    step={0.005}
                    formattedValue={chroma.toFixed(3)}
                    track={`linear-gradient(90deg in oklch, oklch(0.6 0 ${hue}), oklch(0.6 0.37 ${hue}))`}
                />
                <Button variant="text" color="secondary" size="small" disabled={!override} onClick={() => setOverride(null)}>
                    Reset to the brand
                </Button>
            </div>
            <Theme
                colorScheme={colorScheme}
                brand={brand}
                density={density}
                style={{ [primaryHueToken]: hue, [primaryChromaToken]: chroma } as CSSProperties}
            >
                <span ref={probeRef} hidden />
                <div className={styles.brandSample}>
                    <div className={styles.brandComponents}>
                        <Button startIcon={<Icon name="add" />}>New job ad</Button>
                        <Button variant="outlined" color="secondary">
                            Import
                        </Button>
                        <Chip color="primary">Published</Chip>
                        <Link href="#" color="accent" endIcon={<Icon name="arrow-right" />} onClick={(event) => event.preventDefault()}>
                            To the page tree
                        </Link>
                        <Checkbox checked={isChecked} onChange={setIsChecked}>
                            Featured
                        </Checkbox>
                        <Switch checked={isChecked} onChange={setIsChecked}>
                            Online
                        </Switch>
                    </div>
                    <ol className={styles.scale} aria-label="Primary scale">
                        {scaleSteps.map((step) => {
                            const token = `--dextinity-color-primary-${step}`;
                            const stepColor = colors[token] ? parseOklch(colors[token]) : null;
                            return (
                                <li key={step} className={styles.scaleStep}>
                                    <span className={styles.scaleSwatch} style={{ background: `var(${token})` }} />
                                    <code>{step}</code>
                                    {stepColor && !isInSrgbGamut(stepColor) && (
                                        <span
                                            className={styles.scaleGamut}
                                            title={`${formatOklch(stepColor)} is outside sRGB${isInDisplayP3Gamut(stepColor) ? ", inside Display P3" : ""}`}
                                        >
                                            {isInDisplayP3Gamut(stepColor) ? "P3" : "clipped"}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </Theme>
            <div className={styles.brandFooter}>
                <code className={styles.code}>
                    {primaryHueToken}: {Math.round(hue)};
                    <br />
                    {primaryChromaToken}: {Number(chroma.toFixed(3))};
                </code>
                <div className={styles.checks}>
                    {accent && accentForeground && canvas && (
                        <ContrastLine label="Text on accent" ratio={contrastRatio(accentForeground, accent, canvas)} />
                    )}
                    {accentText && canvas && <ContrastLine label="Accent text on canvas" ratio={contrastRatio(accentText, canvas, canvas)} />}
                    {accentOklch && <GamutChips color={accentOklch} />}
                </div>
            </div>
        </DocsDemo>
    );
}

const formatComparison = [
    ["Readable for people", "no", "partly", "yes"],
    ["Same number = same lightness", "no", "no", "yes"],
    ["Computing scales and states", "by hand", "imprecise", "reliable"],
    ["Gradients without gray mud", "no", "partly", "yes"],
    ["Display P3", "no", "no", "yes"],
    ["Browsers", "all", "all", "all current ones (since 2023)"],
    ["Figma", "yes", "yes", "only through a plugin or exported as hex"],
];

/**
 * Hex, HSL, and OKLCH compared.
 */
export function ColorFormatComparison() {
    return (
        <DocsDemo>
            <table className={foundationStyles.table}>
                <thead>
                    <tr>
                        <td />
                        <th scope="col">Hex / RGB</th>
                        <th scope="col">HSL</th>
                        <th scope="col">OKLCH</th>
                    </tr>
                </thead>
                <tbody>
                    {formatComparison.map(([criterion, ...formats]) => (
                        <tr key={criterion}>
                            <th scope="row">{criterion}</th>
                            {formats.map((format, index) => (
                                <td key={index}>{format}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </DocsDemo>
    );
}
