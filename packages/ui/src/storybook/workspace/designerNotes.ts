import type { DesignerNote, NoteAnchor, NoteViewSettings } from "./workspaceNotes";

/** The readable names of a note's place, for showing and sharing it outside the Workbench. */
export interface NotePlace {
    prototypeName: string;
    pageLabel: string;
}

export type DescribeNotePlace = (page: PrototypePage) => NotePlace;

export type NoteScope = "page" | "all";

export type NoteStatusFilter = "open" | "done" | "all";

/** A page of a prototype, e.g. the one the Workbench shows. */
export interface PrototypePage {
    prototypeId: string;
    page: string;
}

/** The size the host's comments accept. */
export const maxCommentBytes = 4096;
export const maxCommentLabelBytes = 128;

const maxElementNameLength = 40;

const implicitRoles: Record<string, string> = {
    a: "link",
    article: "article",
    aside: "aside",
    button: "button",
    dialog: "dialog",
    footer: "footer",
    form: "form",
    header: "header",
    img: "image",
    label: "label",
    li: "list item",
    main: "main",
    nav: "navigation",
    ol: "list",
    p: "paragraph",
    select: "select",
    table: "table",
    td: "cell",
    textarea: "text field",
    th: "column header",
    ul: "list",
};

const inputRoles: Record<string, string> = {
    button: "button",
    checkbox: "checkbox",
    radio: "radio button",
    range: "slider",
    reset: "button",
    submit: "button",
};

function getRole(element: Element) {
    const explicitRole = element.getAttribute("role");
    if (explicitRole) {
        return explicitRole;
    }
    const tag = element.tagName.toLowerCase();
    const headingLevel = tag.match(/^h([1-6])$/)?.[1];
    if (headingLevel) {
        return `heading ${headingLevel}`;
    }
    if (tag === "input") {
        return inputRoles[element.getAttribute("type") ?? ""] ?? "text field";
    }
    return implicitRoles[tag] ?? tag;
}

function shorten(text: string, maxLength: number) {
    const collapsed = text.replace(/\s+/g, " ").trim();
    return collapsed.length > maxLength ? `${collapsed.slice(0, maxLength - 1).trimEnd()}…` : collapsed;
}

function getName(element: Element) {
    const name =
        element.getAttribute("aria-label") ??
        element.getAttribute("alt") ??
        element.getAttribute("placeholder") ??
        element.getAttribute("title") ??
        element.textContent ??
        "";
    return shorten(name, maxElementNameLength);
}

// CSS Modules name the classes after the component, e.g. `_Card_root_1x2y`
function getComponentName(element: Element) {
    const firstClass = typeof element.className === "string" ? element.className.split(" ")[0] : "";
    return firstClass?.match(/^_?([A-Z][A-Za-z]+)_/)?.[1] ?? null;
}

/** Describes an element for a reader who doesn't see the page, by its role and its text, e.g. `button “Save”`. */
export function describeNoteElement(element: Element) {
    const role = getRole(element);
    const name = getName(element);
    if (name !== "") {
        return `${role} “${name}”`;
    }
    const componentName = getComponentName(element);
    return componentName ? `${role} in ${componentName}` : role;
}

/** The number of the note's pin: its place among the notes of its prototype. */
export function getNoteNumber(notes: DesignerNote[], note: DesignerNote) {
    return notes.filter((item) => item.prototypeId === note.prototypeId).findIndex((item) => item.id === note.id) + 1;
}

export function formatViewSettings(view: NoteViewSettings) {
    return [
        `${view.viewportWidth} × ${view.viewportHeight}`,
        view.brand,
        view.colorScheme,
        `${view.density} density`,
        `${view.textLength} text length`,
        `${view.content} content`,
    ].join(" · ");
}

export function formatNoteTime(isoTime: string) {
    const date = new Date(isoTime);
    return Number.isNaN(date.getTime()) ? isoTime : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function byteLength(text: string) {
    return new TextEncoder().encode(text).length;
}

/** Cuts the text to at most `maxBytes` of UTF-8, between characters, and marks the cut with an ellipsis. */
export function truncateToBytes(text: string, maxBytes: number) {
    if (byteLength(text) <= maxBytes) {
        return text;
    }
    const ellipsis = "…";
    let result = "";
    for (const character of text) {
        if (byteLength(result + character + ellipsis) > maxBytes) {
            break;
        }
        result += character;
    }
    return result + ellipsis;
}

/**
 * The note as a comment for readers who don't see the Workbench, e.g. on the published artifact or in the chat with Claude: with the
 * prototype, page, element, and view it was written in.
 */
export function formatNoteComment(note: DesignerNote, place: NotePlace) {
    const details = [
        `Prototype: ${place.prototypeName} (\`${note.prototypeId}\`)`,
        `Page: ${place.pageLabel} (\`${note.page}\`)`,
        `Element: ${note.element ?? "not recorded"}`,
        `View: ${note.view ? formatViewSettings(note.view) : "not recorded"}`,
        `Status: ${note.resolved ? "done" : "open"}`,
    ];
    const heading = "Designer note from the Workbench:";
    const frame = `${heading}\n\n\n\n${details.join("\n")}`;
    const text = truncateToBytes(note.text.trim(), maxCommentBytes - byteLength(frame));
    return {
        text: `${heading}\n\n${text}\n\n${details.join("\n")}`,
        label: truncateToBytes(`Note · ${place.pageLabel}`, maxCommentLabelBytes),
    };
}

/** Groups the items by their page, the current page first, then in the order their pages first come up. */
export function groupByPage<Item extends NoteAnchor>(items: Item[], current: PrototypePage) {
    const groups = new Map<string, { prototypeId: string; page: string; items: Item[] }>();
    const currentKey = JSON.stringify([current.prototypeId, current.page]);
    for (const item of items) {
        const key = JSON.stringify([item.prototypeId, item.page]);
        const group = groups.get(key) ?? { prototypeId: item.prototypeId, page: item.page, items: [] };
        group.items.push(item);
        groups.set(key, group);
    }
    return Array.from(groups.entries())
        .sort(([a], [b]) => Number(b === currentKey) - Number(a === currentKey))
        .map(([key, group]) => ({ key, ...group }));
}

export function filterByScope<Item extends NoteAnchor>(items: Item[], scope: NoteScope, current: PrototypePage) {
    return scope === "all" ? items : items.filter((item) => item.prototypeId === current.prototypeId && item.page === current.page);
}

export function filterNotes(notes: DesignerNote[], { scope, status }: { scope: NoteScope; status: NoteStatusFilter }, current: PrototypePage) {
    return filterByScope(notes, scope, current).filter((note) => status === "all" || (status === "done") === (note.resolved === true));
}

/** All notes as a Markdown checklist, grouped by page, e.g. for a ticket. */
export function formatNotesMarkdown(notes: DesignerNote[], describePlace: DescribeNotePlace, current: PrototypePage) {
    const sections = groupByPage(notes, current).map((group) => {
        const place = describePlace(group);
        const entries = group.items.map((note) => {
            const details = [
                note.element && `Element: ${note.element}`,
                note.view && `View: ${formatViewSettings(note.view)}`,
                note.createdAt && `Written: ${formatNoteTime(note.createdAt)}`,
            ].filter((detail): detail is string => Boolean(detail));
            return [`- [${note.resolved ? "x" : " "}] ${note.text.trim().replace(/\n+/g, " ")}`, ...details.map((detail) => `    - ${detail}`)].join(
                "\n",
            );
        });
        return [`## ${place.prototypeName} · ${place.pageLabel}`, "", ...entries].join("\n");
    });
    return ["# Designer notes", "", sections.join("\n\n")].join("\n");
}
