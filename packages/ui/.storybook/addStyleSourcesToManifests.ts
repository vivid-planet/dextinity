import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ComponentsManifest, PresetPropertyFn } from "storybook/internal/types";

import { parseStoryFile, renderBodyOf, storyExportsOf, styleImportsOf, styleImportsUsedIn } from "./storyFile";

type StoryEntry = { id: string; importPath: string; exportName: string };

type ManifestStory = ComponentsManifest["components"][string]["stories"][number];

/**
 * Adds the `.module.scss` files that each story's `render` function uses to its description in the components manifest.
 * The MCP server gives that description to agents.
 */
export const addStyleSourcesToManifests: PresetPropertyFn<"experimental_manifests"> = async (manifests, options) => {
    const componentsManifest = manifests?.components;
    if (!componentsManifest || !("manifestEntries" in options) || !Array.isArray(options.manifestEntries)) {
        return manifests;
    }
    const styleSourcesByStoryId = await readStyleSourcesByStoryId(options.manifestEntries.filter(isStoryEntry));
    return { ...manifests, components: withStyleSourcesInDescriptions(componentsManifest, styleSourcesByStoryId) };
};

function isStoryEntry(entry: unknown): entry is StoryEntry {
    return (
        typeof entry === "object" &&
        entry !== null &&
        "type" in entry &&
        entry.type === "story" &&
        "id" in entry &&
        typeof entry.id === "string" &&
        "importPath" in entry &&
        typeof entry.importPath === "string" &&
        "exportName" in entry &&
        typeof entry.exportName === "string"
    );
}

async function readStyleSourcesByStoryId(storyEntries: StoryEntry[]) {
    const styleSourcesByStoryId = new Map<string, string>();
    for (const storyEntry of storyEntries) {
        const styleSource = await readStyleSource(storyEntry);
        if (styleSource !== undefined) {
            styleSourcesByStoryId.set(storyEntry.id, styleSource);
        }
    }
    return styleSourcesByStoryId;
}

async function readStyleSource({ importPath, exportName }: StoryEntry) {
    const storyFilePath = path.resolve(importPath);
    const storyFile = parseStoryFile(await readFile(storyFilePath, "utf-8"), storyFilePath);
    const storyExport = storyExportsOf(storyFile).find((candidate) => candidate.exportName === exportName);
    const renderBody = storyExport && renderBodyOf(storyExport.storyObject);
    if (!renderBody) {
        return undefined;
    }
    const usedStyleImports = styleImportsUsedIn(renderBody, styleImportsOf(storyFile));
    if (usedStyleImports.length === 0) {
        return undefined;
    }
    const styleSources = await Promise.all(
        usedStyleImports.map(({ modulePath }) => readFile(path.resolve(path.dirname(storyFilePath), modulePath), "utf-8")),
    );
    return styleSources.join("\n\n");
}

function withStyleSourcesInDescriptions(componentsManifest: ComponentsManifest, styleSourcesByStoryId: Map<string, string>): ComponentsManifest {
    const components = Object.fromEntries(
        Object.entries(componentsManifest.components).map(([componentId, component]) => [
            componentId,
            { ...component, stories: component.stories.map((story) => withStyleSourceInDescription(story, styleSourcesByStoryId.get(story.id))) },
        ]),
    );
    return { ...componentsManifest, components };
}

function withStyleSourceInDescription(story: ManifestStory, styleSource: string | undefined): ManifestStory {
    if (styleSource === undefined) {
        return story;
    }
    const styleSourceMarkdown = `\`\`\`scss\n${styleSource.trimEnd()}\n\`\`\``;
    return {
        ...story,
        description: story.description ? `${story.description}\n\n${styleSourceMarkdown}` : styleSourceMarkdown,
        // The MCP server shows only the summary for all but the first three stories of a component
        summary: story.summary ?? story.description,
    };
}
