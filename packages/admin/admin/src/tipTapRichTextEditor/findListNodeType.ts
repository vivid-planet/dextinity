import type { ResolvedPos } from "@tiptap/pm/model";

/**
 * The node type of the innermost list a position sits in, which only the position tells - a text
 * block node is the same inside a list item as outside one. Nested lists may mix types, so the
 * innermost one decides, the same way the API validates a list item's content against it.
 */
export function findListNodeType($pos: ResolvedPos): "orderedList" | "bulletList" | undefined {
    for (let depth = $pos.depth; depth > 0; depth--) {
        const nodeType = $pos.node(depth).type.name;
        if (nodeType === "orderedList" || nodeType === "bulletList") {
            return nodeType;
        }
    }
    return undefined;
}
