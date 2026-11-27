import type { DescribeNotePlace } from "./designerNotes";
import { isInCodeRequest, type TextChange } from "./workspaceNotes";

/** The changes the designer chose for the code request. */
export function getCodeRequestChanges(changes: TextChange[]) {
    return changes.filter(isInCodeRequest);
}

/**
 * A request to paste into the chat with Claude, which changes the texts in the prototypes' code, where they then stay for everyone.
 * Pass only the changes that go into the request, see `getCodeRequestChanges`.
 */
export function formatCodeRequest(changes: TextChange[], describePlace: DescribeNotePlace) {
    return [
        "Please change these texts in the code of the Workbench prototypes (packages/ui/src/storybook/workspace):",
        ...changes.map((change) => {
            const place = describePlace(change);
            const element = change.element ? `, ${change.element}` : "";
            return `- Prototype \`${change.prototypeId}\`, page “${place.pageLabel}” (\`${change.page}\`)${element}: “${change.original.trim()}” → “${change.text.trim()}”`;
        }),
        "Then remove them from the text changes in the Workbench, since the prototype shows them itself.",
    ].join("\n");
}

export function formatTextChanges(changes: TextChange[], describePlace: DescribeNotePlace) {
    return changes
        .map((change) => {
            const place = describePlace(change);
            return `- [${place.prototypeName} · ${place.pageLabel}] “${change.original.trim()}” → “${change.text.trim()}”`;
        })
        .join("\n");
}
