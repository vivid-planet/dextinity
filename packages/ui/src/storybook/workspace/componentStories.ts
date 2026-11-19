import type { IndexedStory } from "./storyTree";

const componentClassPattern = /^dextinity([A-Z][A-Za-z0-9]*)$/;
// `Theme` wraps every story, so pointing at it would never lead anywhere useful
const ignoredComponents = new Set(["Theme"]);

/**
 * Maps each component name to the story that shows it: the `Default` story of the stories whose title ends in the component name,
 * e.g. `TopBar` to a story of `Shell/Top bar & scope/TopBar`, or the first of them if none is called `Default`.
 */
export function getComponentStoryIds(stories: IndexedStory[]): Map<string, string> {
    const storyIds = new Map<string, string>();
    for (const story of stories) {
        const componentName = story.title.split("/").at(-1) ?? "";
        if (!storyIds.has(componentName) || story.name === "Default") {
            storyIds.set(componentName, story.id);
        }
    }
    return storyIds;
}

/**
 * The name of the component an element is the root of, read from the stable root class of the class-name contract, e.g.
 * `dextinityTopBar` for `TopBar`.
 */
export function getComponentName(element: Element): string | undefined {
    for (const className of element.classList) {
        const componentName = componentClassPattern.exec(className)?.[1];
        if (componentName != null && !ignoredComponents.has(componentName)) {
            return componentName;
        }
    }
    return undefined;
}

/** The closest element at or above `element` that is the root of a component with a story. */
export function findComponentWithStory(element: Element | null, componentStoryIds: Map<string, string>) {
    for (let current = element; current != null; current = current.parentElement) {
        const componentName = getComponentName(current);
        const storyId = componentName != null ? componentStoryIds.get(componentName) : undefined;
        if (componentName != null && storyId != null) {
            return { element: current, componentName, storyId };
        }
    }
    return undefined;
}
