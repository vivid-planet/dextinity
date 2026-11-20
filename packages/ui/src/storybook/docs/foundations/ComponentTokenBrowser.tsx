/// <reference types="vite/client" />

import { useState } from "react";

import { TokenTable } from "../TokenTable";

const sources = import.meta.glob<string>("../../../components/*/*.tokens.scss", { query: "?raw", import: "default", eager: true });

const components = Object.entries(sources)
    .map(([path, source]) => ({ feature: path.split("/").at(-2) ?? path, source }))
    .sort((a, b) => a.feature.localeCompare(b.feature));

/**
 * Picks a component and lists its component tokens with their live values.
 */
export function ComponentTokenBrowser() {
    const [feature, setFeature] = useState(components.find(({ feature }) => feature === "button")?.feature ?? components[0]?.feature);
    const selected = components.find((component) => component.feature === feature);

    return (
        <div>
            <label>
                Component{" "}
                <select value={feature} onChange={(event) => setFeature(event.target.value)}>
                    {components.map((component) => (
                        <option key={component.feature} value={component.feature}>
                            {component.feature}
                        </option>
                    ))}
                </select>
            </label>
            {selected && <TokenTable tokens={selected.source} />}
        </div>
    );
}
