import path from "node:path";

import type { ComponentManifest, Manifests } from "storybook/internal/types";

import type { TokenDefinition } from "../src/storybook/docs/parseTokens";
import { componentTokensOf } from "./componentTokens";

/**
 * Adds the tokens that each component's docs page lists to its description in the components manifest. The MCP server gives that
 * description to agents.
 */
export function addComponentTokensToManifests(manifests: Manifests | undefined): Manifests | undefined {
    const componentsManifest = manifests?.components;
    if (!componentsManifest) {
        return manifests;
    }
    const components = Object.fromEntries(
        Object.entries(componentsManifest.components).map(([componentId, component]) => [componentId, withTokensInDescription(component)]),
    );
    return { ...manifests, components: { ...componentsManifest, components } };
}

function withTokensInDescription(component: ComponentManifest): ComponentManifest {
    const tokens = componentTokensOf(path.resolve(component.path))?.tokens ?? [];
    if (tokens.length === 0) {
        return component;
    }
    const tokensMarkdown = ["## Tokens", "", ...tokens.map(tokenListItem)].join("\n");
    return {
        ...component,
        description: component.description ? `${component.description}\n\n${tokensMarkdown}` : tokensMarkdown,
        summary: listedSummaryOf(component),
    };
}

function listedSummaryOf(component: ComponentManifest) {
    return component.summary ?? component.description ?? "";
}

function tokenListItem({ name, description, definition, darkDefinition, highContrastDefinition }: TokenDefinition) {
    const values = [
        `default \`${definition}\``,
        darkDefinition && `dark and high contrast \`${darkDefinition}\``,
        highContrastDefinition && `high contrast \`${highContrastDefinition}\``,
    ].filter(Boolean);
    const nameWithValues = `\`${name}\` (${values.join("; ")})`;
    return description ? `- ${nameWithValues}: ${description}` : `- ${nameWithValues}`;
}
