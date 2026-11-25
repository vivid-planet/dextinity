import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { Slider } from "../../components/slider/Slider";
import type { ThemeBrand } from "../../theme/types";
import { getInitialValue, getOverrideCss, playgroundTokens, tokenOverrideList } from "./tokenPlayground";
import styles from "./WorkspaceToolbarControls.module.scss";

/**
 * Changes the brand's tokens of every prototype frame live, e.g. the accent hue or the corner radii, to try a theme idea and
 * pass it on as CSS.
 */
export function TokenSliders({ brand }: { brand: ThemeBrand }) {
    const [copied, setCopied] = useState(false);
    const overrides = tokenOverrideList.useItems();

    // Kept even when it matches the brand's value, so that it stays when the designer switches to a brand with another value
    function change(name: string, value: number) {
        tokenOverrideList.update((items) => [...items.filter((item) => item.name !== name), { name, value }]);
    }

    return (
        <>
            {playgroundTokens.map((token) => {
                const value = overrides.find((item) => item.name === token.name)?.value ?? getInitialValue(token, brand);
                return (
                    <Field key={token.name} layout="group" label={`${token.label} · ${value}${token.unit}`}>
                        <Slider min={token.min} max={token.max} step={token.step} value={value} onChange={(next) => change(token.name, next)} />
                    </Field>
                );
            })}
            <div className={styles.popoverActions}>
                <Button variant="text" color="secondary" size="small" disabled={overrides.length === 0} onClick={() => tokenOverrideList.set([])}>
                    Reset tokens
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Icon name={copied ? "check-circle" : "copy"} />}
                    disabled={overrides.length === 0}
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(getOverrideCss(overrides));
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 1500);
                        } catch {
                            setCopied(false);
                        }
                    }}
                >
                    {copied ? "Copied" : "Copy as CSS"}
                </Button>
            </div>
        </>
    );
}
