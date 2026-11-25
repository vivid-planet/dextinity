import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ComponentsManifest, PresetPropertyFn } from "storybook/internal/types";

import { renderSourceWithWrittenArgs } from "../src/storybook/renderSourceWithArgs";
import { type StoryCode, storyCodesOf } from "./storyCodePlugin";
import { parseStoryFile } from "./storyFile";

type StoryEntry = { id: string; importPath: string; exportName: string };

type ManifestStory = ComponentsManifest["components"][string]["stories"][number];

type ManifestStoryCode = { snippet: string; styleSource: string | undefined };

/**
 * Gives each story in the components manifest the code that its docs show, and the `.module.scss` files that the code uses in
 * its description. The MCP server gives both to agents.
 */
export const addStoryCodeToManifests: PresetPropertyFn<"experimental_manifests"> = async (manifests, options) => {
    const componentsManifest = manifests?.components;
    if (!componentsManifest || !("manifestEntries" in options) || !Array.isArray(options.manifestEntries)) {
        return manifests;
    }
    const storyCodesByStoryId = await readStoryCodesByStoryId(options.manifestEntries.filter(isStoryEntry));
    return { ...manifests, components: withStoryCodes(componentsManifest, storyCodesByStoryId) };
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

async function readStoryCodesByStoryId(storyEntries: StoryEntry[]) {
    const storyCodesByStoryId = new Map<string, ManifestStoryCode>();
    const storyCodesByFilePath = new Map<string, StoryCode[]>();
    for (const { id, importPath, exportName } of storyEntries) {
        const storyFilePath = path.resolve(importPath);
        const storyCodes =
            storyCodesByFilePath.get(storyFilePath) ?? storyCodesOf(parseStoryFile(await readFile(storyFilePath, "utf-8"), storyFilePath));
        storyCodesByFilePath.set(storyFilePath, storyCodes);
        const storyCode = storyCodes.find((candidate) => candidate.exportName === exportName);
        if (storyCode) {
            storyCodesByStoryId.set(id, await manifestStoryCodeOf(storyCode, storyFilePath));
        }
    }
    return storyCodesByStoryId;
}

async function manifestStoryCodeOf(storyCode: StoryCode, storyFilePath: string): Promise<ManifestStoryCode> {
    const styleSources = await Promise.all(
        storyCode.usedStyleImports.map(({ modulePath }) => readFile(path.resolve(path.dirname(storyFilePath), modulePath), "utf-8")),
    );
    return {
        snippet: renderSourceWithWrittenArgs(storyCode),
        styleSource: styleSources.length > 0 ? styleSources.join("\n\n") : undefined,
    };
}

function withStoryCodes(componentsManifest: ComponentsManifest, storyCodesByStoryId: Map<string, ManifestStoryCode>): ComponentsManifest {
    const components = Object.fromEntries(
        Object.entries(componentsManifest.components).map(([componentId, component]) => [
            componentId,
            { ...component, stories: component.stories.map((story) => withStoryCode(story, storyCodesByStoryId.get(story.id))) },
        ]),
    );
    return { ...componentsManifest, components };
}

function withStoryCode(story: ManifestStory, storyCode: ManifestStoryCode | undefined): ManifestStory {
    if (storyCode === undefined) {
        return story;
    }
    return withStyleSourceInDescription({ ...story, snippet: storyCode.snippet, warning: undefined }, storyCode.styleSource);
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
