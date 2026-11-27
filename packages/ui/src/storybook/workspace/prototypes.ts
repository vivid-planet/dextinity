import { sideNavGroups } from "../../components/sideNav/__stories__/sideNavStoryData";
import type { SideNavGroup, SideNavItem } from "../../components/sideNav/SideNav";
import { cmsNavGroups, getCmsAssetFolderTrail, getCmsPageLabel } from "./cmsPrototype/cmsData";

/** A step above a page, as the app's menu and breadcrumbs show it; a step that isn't a page, e.g. a menu group or an asset folder, has no `pageId`. */
export interface PageAncestor {
    id: string;
    label: string;
    pageId?: string;
}

export interface WorkspacePrototype {
    storyId: string;
    appName: string;
    startPageId: string;
    /** The pages with a design, in the order of the navigation; the other entries of the navigation show a placeholder. */
    designedPageIds: string[];
    /** The label of a page the prototype knows, `undefined` for any other id. */
    getPageLabel: (pageId: string) => string | undefined;
    /** The steps from the app's menu down to a page, without the page itself. */
    getPageAncestors: (pageId: string) => PageAncestor[];
}

/** A label for a page the prototype doesn't know, made from the last part of its id, e.g. `Old news` for `news/old-news`. */
export function humanizePageId(pageId: string) {
    const words = (pageId.split("/").at(-1) ?? "").replace(/[-_]+/g, " ").trim();
    return words === "" ? pageId : `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
}

/** For a page whose prototype has no menu, e.g. one that isn't a prototype the workspace knows. */
export function noPageAncestors(): PageAncestor[] {
    return [];
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

/** The menu entries above the entry, outermost first, or `undefined` when the menu doesn't have it. */
function findNavTrail(items: SideNavItem[], id: string): SideNavItem[] | undefined {
    for (const item of items) {
        if (item.id === id) {
            return [];
        }
        const trail = findNavTrail(item.children ?? [], id);
        if (trail) {
            return [item, ...trail];
        }
    }
    return undefined;
}

/**
 * The ancestors of a page in an app whose detail pages are `<section>/<id>`: the menu entries above the section, then the
 * section's page, then the steps `getDetailTrail` adds between the section and the detail page.
 */
function createGetPageAncestors(
    navGroups: SideNavGroup[],
    getPageLabel: (pageId: string) => string | undefined,
    getDetailTrail: (pageId: string) => PageAncestor[] = () => [],
) {
    const navItems = navGroups.flatMap((group) => group.items);
    return (pageId: string): PageAncestor[] => {
        const [section, detail] = pageId.split("/");
        const menuSteps = (findNavTrail(navItems, section) ?? []).map((item) => ({
            id: `menu:${item.id}`,
            label: item.label,
            pageId: item.href ? item.href.slice(1) : undefined,
        }));
        if (detail == null) {
            return menuSteps;
        }
        return [...menuSteps, { id: section, label: getPageLabel(section) ?? section, pageId: section }, ...getDetailTrail(pageId)];
    };
}

function getCareerPortalPageLabel(pageId: string) {
    return findNavItem(
        sideNavGroups.flatMap((group) => group.items),
        pageId,
    )?.label;
}

export const careerPortalPrototype: WorkspacePrototype = {
    storyId: "workspace-prototypes--career-portal",
    appName: "Career portal",
    startPageId: "dashboard",
    designedPageIds: ["dashboard", "page-tree", "job-ads", "redirects", "assets"],
    getPageLabel: getCareerPortalPageLabel,
    getPageAncestors: createGetPageAncestors(sideNavGroups, getCareerPortalPageLabel),
};

export const cmsPrototype: WorkspacePrototype = {
    storyId: "workspace-prototypes--cms",
    appName: "Website CMS",
    startPageId: "dashboard",
    designedPageIds: [
        "dashboard",
        "page-tree",
        "page-tree/home",
        "news",
        "news/article-1",
        "assets",
        "redirects",
        // The asset detail page in every format, from the library's demo folder
        "assets/landscape-3x2-6000x4000",
        "assets/landscape-16x9-1920x1080",
        "assets/ultrawide-21x9-5040x2160",
        "assets/panorama-10x3-4000x1200",
        "assets/square-1x1-3000x3000",
        "assets/portrait-3x4-3000x4000",
        "assets/portrait-2x3-4000x6000",
        "assets/portrait-9x16-1080x1920",
        "assets/small-icon-128x128",
        "assets/transparent-png-2400x1200",
        "assets/document-portrait-a4-3-pages",
        "assets/document-landscape-slides-12-pages",
        "assets/video-landscape-16x9-0-42",
        "assets/video-portrait-9x16-0-15",
        "assets/audio-0-34",
    ],
    getPageLabel: getCmsPageLabel,
    getPageAncestors: createGetPageAncestors(cmsNavGroups, getCmsPageLabel, getCmsAssetFolderTrail),
};

/** The prototypes by their story's id, for the workspace to list their pages. */
export const workspacePrototypes = new Map([careerPortalPrototype, cmsPrototype].map((prototype) => [prototype.storyId, prototype]));
