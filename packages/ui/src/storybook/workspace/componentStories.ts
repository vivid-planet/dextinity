/** A story from Storybook's story index. */
export interface IndexedStory {
    id: string;
    title: string;
    name: string;
}

const componentClassPattern = /^dextinity([A-Z][A-Za-z0-9]*)$/;
// `Theme` wraps every story, and an `Icon` sits inside the button or item it belongs to, which is what's meant when pointing at it
const ignoredComponents = new Set(["Theme", "Icon"]);
// Pages about a pattern or a page type can end in a component's name, e.g. `Patterns/Toolbar`, but don't show the component itself
const componentSections = ["Building blocks/", "Shell/", "Foundations/"];

function getSectionRank(title: string) {
    const rank = componentSections.findIndex((section) => title.startsWith(section));
    return rank === -1 ? componentSections.length : rank;
}

/**
 * Maps each component name to the story that shows it: the `Default` story, or else the first, of the stories whose title ends in
 * the component name, e.g. `TopBar` to a story of `Shell/Top bar & scope/TopBar`. Titles in the component sections win over
 * pattern and page-type titles that end in the same name.
 */
export function getComponentStoryIds(stories: IndexedStory[]): Map<string, string> {
    const chosen = new Map<string, { storyId: string; title: string; rank: number }>();
    for (const story of stories) {
        const componentName = story.title.split("/").at(-1) ?? "";
        const rank = getSectionRank(story.title);
        const current = chosen.get(componentName);
        const isBetterTitle = current == null || rank < current.rank;
        const isDefaultOfSameTitle = current?.title === story.title && story.name === "Default";
        if (isBetterTitle || isDefaultOfSameTitle) {
            chosen.set(componentName, { storyId: story.id, title: story.title, rank });
        }
    }
    return new Map([...chosen].map(([componentName, { storyId }]) => [componentName, storyId]));
}

/**
 * The names of the components an element is the root of, read from the stable root classes of the class-name contract, e.g.
 * `TopBar` for `dextinityTopBar`. A component that renders another one adds its class after the inner one's, e.g.
 * `dextinityIconButton dextinityToolbarButton`, so the outermost component comes first in the result.
 */
export function getComponentNames(element: Element): string[] {
    const names: string[] = [];
    for (const className of element.classList) {
        const componentName = componentClassPattern.exec(className)?.[1];
        if (componentName != null && !ignoredComponents.has(componentName)) {
            names.unshift(componentName);
        }
    }
    return names;
}

/** The closest element at or above `element` that is the root of a component with a story, preferring the outermost component. */
export function findComponentWithStory(element: Element | null, componentStoryIds: Map<string, string>) {
    for (let current = element; current != null; current = current.parentElement) {
        for (const componentName of getComponentNames(current)) {
            const storyId = componentStoryIds.get(componentName);
            if (storyId != null) {
                return { element: current, componentName, storyId };
            }
        }
    }
    return undefined;
}
