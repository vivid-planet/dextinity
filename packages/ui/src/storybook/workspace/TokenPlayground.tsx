import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Field } from "../../components/field/Field";
import { Icon } from "../../components/icon/Icon";
import { Slider } from "../../components/slider/Slider";
import { getOverrideCss, playgroundTokens, tokenOverrideList } from "./tokenPlayground";
import styles from "./WorkspaceToolbarControls.module.scss";

/**
 * Changes the brand's tokens of every prototype frame live, e.g. the accent hue or the corner radii, to try a theme idea and
 * pass it on as CSS.
 */
export function TokenSliders() {
    const [copied, setCopied] = useState(false);
    const overrides = tokenOverrideList.useItems();

    function change(name: string, value: number) {
        const initial = playgroundTokens.find((token) => token.name === name)?.initial;
        tokenOverrideList.update((items) => [...items.filter((item) => item.name !== name), ...(value === initial ? [] : [{ name, value }])]);
    }

    return (
        <>
            {playgroundTokens.map((token) => {
                const value = overrides.find((item) => item.name === token.name)?.value ?? token.initial;
                return (
                    <Field key={token.name} label={`${token.label} · ${value}${token.unit}`}>
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
