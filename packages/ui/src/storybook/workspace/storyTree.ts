import type { TreeNode } from "../../components/treeView/TreeView";

export interface IndexedStory {
    id: string;
    title: string;
    name: string;
}

const folderIdPrefix = "folder:";

export function isFolderId(id: string) {
    return id.startsWith(folderIdPrefix);
}

function getFolderId(titlePath: string) {
    return `${folderIdPrefix}${titlePath}`;
}

/**
 * Nests the stories by the segments of their title, e.g. `Building blocks/Buttons/Button` becomes the folders "Building blocks" →
 * "Buttons" → "Button" with the stories inside. Keeps the order of the story index.
 */
export function buildStoryTree(stories: IndexedStory[]): TreeNode[] {
    const roots: TreeNode[] = [];
    const folders = new Map<string, TreeNode>();

    function getFolder(segments: string[]): TreeNode[] {
        let siblings = roots;
        for (let depth = 0; depth < segments.length; depth++) {
            const titlePath = segments.slice(0, depth + 1).join("/");
            let folder = folders.get(titlePath);
            if (!folder) {
                folder = { id: getFolderId(titlePath), label: segments[depth], type: "folder", children: [] };
                folders.set(titlePath, folder);
                siblings.push(folder);
            }
            siblings = folder.children ?? [];
        }
        return siblings;
    }

    for (const story of stories) {
        getFolder(story.title.split("/")).push({ id: story.id, label: story.name, type: "page" });
    }

    for (const folder of folders.values()) {
        folder.count = folder.children?.length;
    }

    return roots;
}

/** The ids of the folders around a story, e.g. to expand them so the story is visible. */
export function getStoryFolderIds(story: IndexedStory): string[] {
    const segments = story.title.split("/");
    return segments.map((_, depth) => getFolderId(segments.slice(0, depth + 1).join("/")));
}
