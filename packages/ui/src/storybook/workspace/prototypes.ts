import { sideNavGroups } from "../../components/sideNav/__stories__/sideNavStoryData";
import type { SideNavItem } from "../../components/sideNav/SideNav";

interface WorkspacePrototype {
    storyId: string;
    appName: string;
    startPageId: string;
    /** The pages with a design, in the order of the navigation; the other entries of the navigation show a placeholder. */
    designedPageIds: string[];
    getPageLabel: (pageId: string) => string | undefined;
}

function findNavItem(items: SideNavItem[], id: string): SideNavItem | undefined {
    for (const item of items) {
        const found = item.id === id ? item : findNavItem(item.children ?? [], id);
        if (found) {
            return found;
        }
    }
    return undefined;
}

export const careerPortalPrototype: WorkspacePrototype = {
    storyId: "workspace-prototypes--career-portal",
    appName: "Career portal",
    startPageId: "dashboard",
    designedPageIds: ["dashboard", "page-tree", "job-ads", "redirects", "assets"],
    getPageLabel: (pageId) =>
        findNavItem(
            sideNavGroups.flatMap((group) => group.items),
            pageId,
        )?.label,
};

/** The prototypes by their story's id, for the workspace to list their pages. */
export const workspacePrototypes = new Map([careerPortalPrototype].map((prototype) => [prototype.storyId, prototype]));
