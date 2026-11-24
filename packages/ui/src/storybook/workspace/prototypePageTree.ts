import type { TreeNode } from "../../components/treeView/TreeView";
import type { PageAncestor } from "./prototypes";

export function getPrototypePageNodeId(storyId: string, pageId: string) {
    return `${storyId}#${pageId}`;
}

// Without a `#`, the list opens and closes the node instead of opening a page
function getGroupNodeId(storyId: string, groupId: string) {
    return `${storyId}>${groupId}`;
}

interface PageTreeInput {
    storyId: string;
    pageIds: string[];
    getPageLabel: (pageId: string) => string | undefined;
    getPageAncestors: (pageId: string) => PageAncestor[];
}

/** The pages nested as in the app's menu and breadcrumbs; a step above a page that isn't listed itself is added for it. */
export function buildPageTree({ storyId, pageIds, getPageLabel, getPageAncestors }: PageTreeInput) {
    const roots: TreeNode[] = [];
    const nodesById = new Map<string, TreeNode>();
    const parentIds = new Map<string, string>();

    function addNode(step: PageAncestor, parent: TreeNode | undefined) {
        const id = step.pageId != null ? getPrototypePageNodeId(storyId, step.pageId) : getGroupNodeId(storyId, step.id);
        let node = nodesById.get(id);
        if (!node) {
            node = { id, label: step.label, type: step.pageId != null ? "page" : "folder" };
            nodesById.set(id, node);
            if (parent) {
                parent.children = [...(parent.children ?? []), node];
                parentIds.set(id, parent.id);
            } else {
                roots.push(node);
            }
        }
        return node;
    }

    for (const pageId of pageIds) {
        let parent: TreeNode | undefined;
        for (const ancestor of getPageAncestors(pageId)) {
            parent = addNode(ancestor, parent);
        }
        addNode({ id: pageId, label: getPageLabel(pageId) ?? pageId, pageId }, parent);
    }

    /** The nodes above a node, outermost first. */
    function getAncestorIds(nodeId: string): string[] {
        const parentId = parentIds.get(nodeId);
        return parentId == null ? [] : [...getAncestorIds(parentId), parentId];
    }

    const groupIds = [...nodesById.values()].filter((node) => node.type === "folder").map((node) => node.id);
    return { nodes: roots, getAncestorIds, groupIds };
}
