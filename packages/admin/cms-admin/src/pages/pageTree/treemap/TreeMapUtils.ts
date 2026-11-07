/**
 * Minimal requirements that a TreeMapNode must specify
 */
export interface TreeMapNode {
    id: string;
    parentId: string | null;
}

/**
 * TreeMap is a class that can store a tree like structure in a map data structure. The root nodes are stored with in the key = "root"
 *
 * Sample Map Structure (key : value)

 *      root: [{ id: "1", parentId: null },{ id: "2", parentId: null },{ id: "3", parentId: null }]
 *      1: [{ id: "11", parentId: "1" },{ id: "12", parentId: "1" }, { id: "13", parentId: "1" }]
 *      2: [{ id: "21", parentId: "2" },{ id: "22", parentId: "2" }]
 *      3: [{ id: "31", parentId: "3" },{ id: "32", parentId: "3" },{ id: "33", parentId: "3" }]
 *      32: "32", [{ id: "321", parentId: "32" },{ id: "322", parentId: "32" }]
 *
 *
 * key: parentId
 * value: child nodes of a node
 *
 */
export class TreeMap<T extends TreeMapNode> extends Map<string, Array<T>> {}

type TreeMapTraverseMode = "pre-order" | "post-order";

export const traverse = <T extends TreeMapNode>(
    tree: TreeMap<T>,
    onTraverse: (element: T, level: number) => void,
    traverseMode: TreeMapTraverseMode = "pre-order",
): void => {
    if (traverseMode === "pre-order") {
        traversePreOrder(tree, onTraverse);
    } else if (traverseMode === "post-order") {
        traversePostOrder(tree, onTraverse);
    } else {
        throw Error("Unknown traverse mode");
    }
};

const traversePreOrder = <T extends TreeMapNode>(tree: TreeMap<T>, onTraverse: (element: T, level: number) => void): void => {
    const traverse = (parentId: string, level = 1) => {
        const children = tree.get(parentId) || [];

        children.forEach((child) => {
            onTraverse(child, level);
            if (tree.get(parentId)) {
                traverse(child.id, level + 1);
            }
        });
    };

    traverse("root", 1);
};

const traversePostOrder = <T extends TreeMapNode>(tree: TreeMap<T>, onTraverse: (element: T, level: number) => void): void => {
    const traverse = (parentId: string, level = 1) => {
        const children = tree.get(parentId) || [];

        children.forEach((child) => {
            if (tree.get(parentId)) {
                traverse(child.id, level + 1);
            }
            onTraverse(child, level);
        });
    };

    traverse("root", 1);
};

/**
 * This functions converts an array to a TreeMap data structure
 * @param nodes
 */
export const arrayToTreeMap = <T extends TreeMapNode>(nodes: T[]): TreeMap<T> => {
    const childrenMap = new TreeMap<T>();

    nodes.forEach((node) => {
        const parentId = node.parentId || "root";

        const children = childrenMap.get(parentId) || [];
        childrenMap.set(parentId, [...children, node]);
    });
    return childrenMap;
};

/**
 * This function converts a treeMap to an array
 * @param tree tree to convert
 * @param root Key where the root nodes are stored in
 */
export const treeMapToArray = <T extends TreeMapNode>(tree: TreeMap<T>, root = "root"): T[] => {
    const buildFlatTreeForParent = (parentId = "root"): T[] => {
        const nodes = tree.get(parentId) || [];

        return nodes.reduce<T[]>((acc, nodeData) => {
            if (parentId === root) {
                return [...acc, { ...nodeData, parentId: null }, ...buildFlatTreeForParent(nodeData.id)];
            } else {
                return [...acc, nodeData, ...buildFlatTreeForParent(nodeData.id)];
            }
        }, []);
    };

    return buildFlatTreeForParent();
};

/**
 * This functions returns a subtree of the tree. The new start tree will start from node
 * @param node New subtree will start (inclusive) this node
 * @param tree
 */
export const subTreeFromNode = <T extends TreeMapNode>(node: T, tree: TreeMap<T>): TreeMap<T> => {
    return subTreeFromId(node.id, tree);
};

export const subTreeFromId = <T extends TreeMapNode>(id: string, tree: TreeMap<T>): TreeMap<T> => {
    const subTreeForParent = (nodeId: string, map = new TreeMap<T>(), parentId = "root", pageFound = false): TreeMap<T> => {
        const children = tree.get(parentId) || [];

        children.forEach((child) => {
            if (pageFound) {
                const presentChildren = map.get(parentId);

                if (presentChildren) {
                    map.set(parentId, [...presentChildren, child]);
                } else {
                    map.set(parentId, [child]);
                }
                subTreeForParent(nodeId, map, child.id, true);
            } else if (child.id === nodeId) {
                map.set("root", [child]);
                subTreeForParent(nodeId, map, child.id, true);
            } else {
                subTreeForParent(nodeId, map, child.id, false);
            }
        });
        return map;
    };

    return subTreeForParent(id);
};

/**
 *
 * Calculates a new subtree based on passed nodeIds. If a parent is not select, child gets attached to closest selected parent.
 * The resulting tree is a subtree only with the passed id's
 *
 *
 * SampleTree:
 *               - 1
 *                   - 11
 *                   - 12
 *                   - 13
 *               - 2
 *                   - 21
 *                   - 22
 *               - 3
 *                   - 31
 *                   - 32
 *                       - 321
 *                       - 322
 *                   - 33
 *
 *
 * Sample:
 *
 * subTreeFromNodes([1,2], tree)
 *
 * Result Tree:
 *
 *              - 1
 *              - 2
 *
 * Sample:
 *
 * subTreeFromNodes([1,2], tree)
 *
 * Result Tree:
 *
 *             - 11
 *             - 2
 *                  - 21
 *             - 3
 *                  - 321
 *
 * @param nodeIds all nodeIds which should be in new subtree
 * @param tree
 */
export const subTreeFromNodes = <T extends TreeMapNode>(nodeIds: string[], tree: TreeMap<T>): TreeMap<T> => {
    const subTreeForParent = (nodeIds: string[], map = new TreeMap<T>(), parentId = "root", lastPickedParent = "root", level = "-"): TreeMap<T> => {
        const children = tree.get(parentId) || [];
        children.forEach((child) => {
            if (nodeIds.includes(child.id)) {
                const presentChildren = map.get(lastPickedParent);

                if (presentChildren) {
                    map.set(lastPickedParent, [...presentChildren, { ...child, parentId: lastPickedParent }]);
                } else {
                    map.set(lastPickedParent, [{ ...child, parentId: lastPickedParent }]);
                }
                subTreeForParent(nodeIds, map, child.id, child.id, `${level}-`);
            } else {
                subTreeForParent(nodeIds, map, child.id, lastPickedParent, `${level}-`);
            }
        });
        return map;
    };

    return subTreeForParent(nodeIds);
};
