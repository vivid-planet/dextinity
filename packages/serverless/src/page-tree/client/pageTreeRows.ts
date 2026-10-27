import type { PageTreeNodeItem } from "./pageTreeApi.types.js";

export interface PageTreeRowItem {
    node: PageTreeNodeItem;
    level: number;
    hasChildren: boolean;
    isExpanded: boolean;
}

interface VisibleRowsOptions {
    expandedIds: ReadonlySet<string>;
    showArchived: boolean;
    /** While searching, the matches and their ancestors are shown, expanded */
    query: string;
}

/** The rows to render for nodes in tree order (as the API returns them): collapsed subtrees, archived pages and non-matches left out */
export function visibleRows(nodes: PageTreeNodeItem[], { expandedIds, showArchived, query }: VisibleRowsOptions): PageTreeRowItem[] {
    const shownNodes = showArchived ? nodes : nodes.filter((node) => node.visibility !== "Archived");
    const nodesById = new Map(shownNodes.map((node) => [node.id, node]));
    const parentIds = new Set(shownNodes.map((node) => node.parentId));
    const levelOf = (node: PageTreeNodeItem): number => {
        const parent = node.parentId ? nodesById.get(node.parentId) : undefined;
        return parent ? levelOf(parent) + 1 : 0;
    };

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
        const includedIds = new Set<string>();
        for (const node of shownNodes) {
            if (node.name.toLowerCase().includes(normalizedQuery) || node.path.toLowerCase().includes(normalizedQuery)) {
                for (
                    let current: PageTreeNodeItem | undefined = node;
                    current;
                    current = current.parentId ? nodesById.get(current.parentId) : undefined
                ) {
                    includedIds.add(current.id);
                }
            }
        }
        return shownNodes
            .filter((node) => includedIds.has(node.id))
            .map((node) => ({ node, level: levelOf(node), hasChildren: parentIds.has(node.id), isExpanded: true }));
    }

    const rows: PageTreeRowItem[] = [];
    const isVisible = (node: PageTreeNodeItem): boolean => {
        const parent = node.parentId ? nodesById.get(node.parentId) : undefined;
        return !parent || (expandedIds.has(parent.id) && isVisible(parent));
    };
    for (const node of shownNodes) {
        if (isVisible(node)) {
            rows.push({ node, level: levelOf(node), hasChildren: parentIds.has(node.id), isExpanded: expandedIds.has(node.id) });
        }
    }
    return rows;
}

/** The parent and 1-based position for dropping a node before, after or into a target node */
export function dropPosition(
    nodes: PageTreeNodeItem[],
    { draggedId, target, placement }: { draggedId: string; target: PageTreeNodeItem; placement: "before" | "after" | "inside" },
): { parentId: string | null; pos: number } {
    const parentId = placement === "inside" ? target.id : target.parentId;
    const siblings = nodes.filter((node) => node.parentId === parentId && node.category === target.category && node.id !== draggedId);
    if (placement === "inside") {
        return { parentId, pos: siblings.length + 1 };
    }
    const index = siblings.findIndex((sibling) => sibling.id === target.id);
    return { parentId, pos: index + (placement === "before" ? 1 : 2) };
}

export function isDescendantOrSelf(nodes: PageTreeNodeItem[], { id, ancestorId }: { id: string; ancestorId: string }): boolean {
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    for (let current = nodesById.get(id); current; current = current.parentId ? nodesById.get(current.parentId) : undefined) {
        if (current.id === ancestorId) {
            return true;
        }
    }
    return false;
}
