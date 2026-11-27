/** A story from Storybook's story index. */
export interface IndexedStory {
    id: string;
    title: string;
    name: string;
}

const componentClassPattern = /^dextinity([A-Z][A-Za-z0-9]*)$/;
const slotClassPattern = /^dextinity([A-Z][A-Za-z0-9]*)__([a-z][A-Za-z0-9]*)$/;
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

export interface ComponentLevel {
    element: Element;
    componentName: string;
    storyId: string;
    /** The part of `componentName` the element is, e.g. `input` for `dextinityFilterBar__input`; absent for the component's root. */
    slotName?: string;
}

/**
 * The parts an element is a slot of, read from the part classes of the class-name contract, e.g. `FilterBar` and `input` for
 * `dextinityFilterBar__input`.
 */
function getSlots(element: Element): Array<{ componentName: string; slotName: string }> {
    const slots: Array<{ componentName: string; slotName: string }> = [];
    for (const className of element.classList) {
        const match = slotClassPattern.exec(className);
        if (match != null) {
            slots.push({ componentName: match[1], slotName: match[2] });
        }
    }
    return slots;
}

/** A slot's name as words in lowercase, e.g. `start icon` for `startIcon`. */
export function getSlotLabel(slotName: string): string {
    return slotName.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
}

function findSlotWithStory(element: Element, componentStoryIds: Map<string, string>): ComponentLevel | undefined {
    for (const { componentName, slotName } of getSlots(element)) {
        const storyId = componentStoryIds.get(componentName);
        if (storyId != null) {
            return { element, componentName, slotName, storyId };
        }
    }
    return undefined;
}

const interactiveTags = new Set(["A", "BUTTON", "LABEL", "SUMMARY", "INPUT", "SELECT", "TEXTAREA"]);

function isInteractive(element: Element): boolean {
    return interactiveTags.has(element.tagName) || element.hasAttribute("tabindex");
}

/**
 * The components with a story at or above `element`, outermost first, so the last one is the most specific component under the
 * pointer. An element that is the root of several components with a story gives one level for each of them.
 *
 * Slots between the innermost component and `element` that belong to a component of the chain add the last levels: the innermost
 * one, e.g. the label of a `SideNav` item, and the interactive ones around it, e.g. the item itself. The elements a component only
 * lays out its parts with, such as lists and scroll areas, don't add levels.
 */
export function findComponentChain(element: Element | null, componentStoryIds: Map<string, string>): ComponentLevel[] {
    const innermostFirst: ComponentLevel[] = [];
    const slotsInnermostFirst: ComponentLevel[] = [];
    for (let current = element; current != null; current = current.parentElement) {
        for (const componentName of getComponentNames(current).reverse()) {
            const storyId = componentStoryIds.get(componentName);
            if (storyId != null) {
                innermostFirst.push({ element: current, componentName, storyId });
            }
        }
        if (innermostFirst.length === 0) {
            const slot = findSlotWithStory(current, componentStoryIds);
            if (slot != null && (slotsInnermostFirst.length === 0 || isInteractive(current))) {
                slotsInnermostFirst.push(slot);
            }
        }
    }
    const chain = innermostFirst.reverse();
    const chainComponentNames = new Set(chain.map(({ componentName }) => componentName));
    const slots = slotsInnermostFirst.filter(({ componentName }) => chainComponentNames.has(componentName)).reverse();
    return [...chain, ...slots];
}

/**
 * The hint after the levels in the picker's label: which keys move the highlight while there is more than one level, and what a click
 * opens, which for a slot is the story of the component it is part of.
 */
export function getLevelHint(chain: Array<Pick<ComponentLevel, "componentName" | "slotName">>, level: number): string {
    const highlighted = chain.at(level);
    const hints = chain.length > 1 ? ["↑ ↓ level"] : [];
    if (highlighted?.slotName != null) {
        hints.push(`part of ${highlighted.componentName}`, `click opens ${highlighted.componentName}`);
    } else {
        hints.push("click opens story");
    }
    return hints.join(" · ");
}

/**
 * The level to highlight in `nextChain` after the pointer moved: the level chosen in `previousChain` while the pointer stays on the
 * same innermost component, else the innermost level.
 */
export function getLevelAfterMove(previousChain: ComponentLevel[], previousLevel: number, nextChain: ComponentLevel[]): number {
    const isSameChain =
        previousChain.length === nextChain.length && previousChain.every((level, index) => level.element === nextChain[index].element);
    return isSameChain ? previousLevel : nextChain.length - 1;
}
