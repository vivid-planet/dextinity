import type { AssetThumbnailBadge, AssetThumbnailType } from "../../../components/assetThumbnail/AssetThumbnail";
import { Icon } from "../../../components/icon/Icon";
import type { SideNavGroup, SideNavItem } from "../../../components/sideNav/SideNav";
import type { TreeNode } from "../../../components/treeView/TreeView";
import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../sampleImages";

export const cmsNavGroups: SideNavGroup[] = [
    {
        label: "Content",
        items: [
            { id: "dashboard", label: "Overview", icon: <Icon name="dashboard" />, href: "#dashboard" },
            { id: "page-tree", label: "Page tree", icon: <Icon name="sitemap" />, href: "#page-tree" },
            {
                id: "structured-data",
                label: "Structured data",
                icon: <Icon name="braces" />,
                children: [
                    { id: "news", label: "News", href: "#news" },
                    { id: "events", label: "Events", href: "#events" },
                    { id: "products", label: "Products", href: "#products" },
                ],
            },
            { id: "assets", label: "Assets", icon: <Icon name="images" />, href: "#assets" },
        ],
    },
    {
        label: "Project",
        items: [
            { id: "main-navigation", label: "Main navigation", icon: <Icon name="menu" />, href: "#main-navigation" },
            { id: "redirects", label: "Redirects", icon: <Icon name="forward" />, href: "#redirects" },
            { id: "translations", label: "Translations", icon: <Icon name="translate" />, href: "#translations" },
        ],
    },
    {
        label: "Administration",
        items: [
            { id: "users", label: "Users", icon: <Icon name="user" />, href: "#users" },
            { id: "settings", label: "Settings", icon: <Icon name="gear" />, href: "#settings" },
        ],
    },
];

export type ContentStatus = "published" | "unpublished" | "archived";

export interface SitePage extends TreeNode {
    template?: string;
    editor?: string;
    edited?: string;
    children?: SitePage[];
}

export const siteTree: SitePage[] = [
    {
        id: "home",
        label: "Home",
        icon: <Icon name="home" />,
        status: "published",
        path: "/",
        template: "Home",
        editor: "Anna Klein",
        edited: "12 min ago",
        children: [
            {
                id: "products",
                label: "Products",
                status: "published",
                path: "/products",
                template: "Overview",
                children: [
                    { id: "cms", label: "Content management", status: "published", path: "/products/content-management" },
                    { id: "commerce", label: "Commerce", status: "published", path: "/products/commerce" },
                    { id: "analytics", label: "Analytics", status: "unpublished", path: "/products/analytics" },
                ],
            },
            {
                id: "services",
                label: "Services",
                status: "published",
                path: "/services",
                template: "Overview",
                children: [
                    { id: "consulting", label: "Consulting", status: "published", path: "/services/consulting" },
                    { id: "support", label: "Support", status: "published", path: "/services/support" },
                ],
            },
            {
                id: "about",
                label: "About us",
                status: "published",
                path: "/about-us",
                editor: "Lena Berger",
                edited: "Yesterday",
                children: [
                    { id: "team", label: "Team", status: "published", path: "/about-us/team" },
                    { id: "history", label: "History", status: "archived", path: "/about-us/history" },
                    { id: "locations", label: "Locations", status: "published", path: "/about-us/locations" },
                ],
            },
            { id: "newsroom", label: "Newsroom", status: "published", path: "/news", template: "News list" },
            { id: "contact", label: "Contact", status: "published", path: "/contact", template: "Form" },
            { id: "shop", label: "Shop", type: "link", status: "published", path: "https://shop.example.com" },
            { id: "imprint", label: "Imprint", status: "published", path: "/imprint", hiddenInMenu: true },
            { id: "privacy", label: "Privacy", status: "published", path: "/privacy", hiddenInMenu: true },
        ],
    },
];

export function flattenPages(pages: SitePage[]): SitePage[] {
    return pages.flatMap((page) => [page, ...flattenPages(page.children ?? [])]);
}

export const allSitePages = flattenPages(siteTree);

export function findPage(id: string) {
    return allSitePages.find((page) => page.id === id);
}

/** The pages above a page, from the root. */
export function findPageTrail(id: string, pages: SitePage[] = siteTree): SitePage[] | undefined {
    for (const page of pages) {
        if (page.id === id) {
            return [];
        }
        const trail = findPageTrail(id, page.children ?? []);
        if (trail != null) {
            return [page, ...trail];
        }
    }
    return undefined;
}

export interface NewsArticle {
    id: string;
    title: string;
    teaser: string;
    category: string;
    author: string;
    date: string;
    status: ContentStatus;
    image: string;
}

export const newsCategories = ["Company", "Product", "Events", "Press"];

const newsTitles: [string, string][] = [
    [
        "Spring release: faster editing in the page tree",
        "The new release brings drag and drop to the page tree and a preview that follows the cursor.",
    ],
    ["We're opening an office in Graz", "From March, a team of twelve works in the new office close to the main square."],
    ["Meet us at the Digital Days in Vienna", "Visit our booth and see the new editor live."],
    ["Analytics now shows conversions per page", "Each page shows the conversions it led to, right in the admin."],
    ["Our sustainability report 2026", "Less travel, green hosting, and a repair day per quarter."],
    ["New partner for commerce integrations", "Shops connect in a few clicks, with stock and prices in sync."],
    ["Behind the scenes: how we test accessibility", "Every component is tested with a screen reader before it ships."],
    ["Webinar: structured content for editors", "One hour on content types, reuse, and translations."],
];

const authors = ["Anna Klein", "Max Mustermann", "Lena Berger"];
const statuses: ContentStatus[] = ["published", "published", "unpublished", "published", "archived", "published", "unpublished", "published"];
const images = [landscapeImage, interiorImage, portraitImage];

export const newsArticles: NewsArticle[] = Array.from({ length: 24 }, (_, index) => {
    const [title, teaser] = newsTitles[index % newsTitles.length];
    return {
        id: `article-${index + 1}`,
        title: index < newsTitles.length ? title : `${title} (${Math.floor(index / newsTitles.length) + 1})`,
        teaser,
        category: newsCategories[index % newsCategories.length],
        author: authors[index % authors.length],
        date: `2026-${String(11 - Math.floor(index / 3)).padStart(2, "0")}-${String(28 - ((index * 5) % 26)).padStart(2, "0")}`,
        status: statuses[index % statuses.length],
        image: images[index % images.length],
    };
});

export function findArticle(id: string) {
    return newsArticles.find((article) => article.id === id);
}

export interface AssetFolder {
    id: string;
    name: string;
    parentId: string | null;
}

export interface Asset {
    id: string;
    name: string;
    folderId: string;
    type: AssetThumbnailType;
    src?: string;
    fileType?: string;
    duration?: string;
    badges?: AssetThumbnailBadge[];
    size: string;
    dimensions?: string;
    uploaded: string;
    alt?: string;
    usedOn: { label: string; href: string }[];
}

export const assetFolders: AssetFolder[] = [
    { id: "root", name: "All assets", parentId: null },
    { id: "pages", name: "Pages", parentId: "root" },
    { id: "products", name: "Products", parentId: "pages" },
    { id: "team", name: "Team", parentId: "pages" },
    { id: "news", name: "News", parentId: "root" },
    { id: "news-2026", name: "2026", parentId: "news" },
    { id: "brand", name: "Brand", parentId: "root" },
    { id: "downloads", name: "Downloads", parentId: "root" },
];

export const assets: Asset[] = [
    {
        id: "home-stage",
        name: "home-stage.jpg",
        folderId: "root",
        type: "image",
        src: landscapeImage,
        size: "2.4 MB",
        dimensions: "2400 × 1600",
        uploaded: "02.10.2026 by Anna Klein",
        alt: "Mountains above a lake in the morning light",
        usedOn: [{ label: "Home", href: "#page-tree/home" }],
    },
    {
        id: "office",
        name: "office-vienna.jpg",
        folderId: "root",
        type: "image",
        src: interiorImage,
        badges: ["missingAlt"],
        size: "3.1 MB",
        dimensions: "2400 × 1600",
        uploaded: "28.09.2026 by Lena Berger",
        usedOn: [
            { label: "About us", href: "#page-tree/about" },
            { label: "We're opening an office in Graz", href: "#news/article-2" },
        ],
    },
    {
        id: "portrait",
        name: "ceo-portrait.png",
        folderId: "root",
        type: "image",
        src: portraitImage,
        size: "840 KB",
        dimensions: "1200 × 1600",
        uploaded: "14.09.2026 by Max Mustermann",
        alt: "Portrait of the CEO",
        usedOn: [{ label: "Team", href: "#page-tree/team" }],
    },
    {
        id: "brochure",
        name: "product-brochure.pdf",
        folderId: "root",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        size: "1.2 MB",
        uploaded: "01.09.2026 by Anna Klein",
        usedOn: [{ label: "Content management", href: "#page-tree/cms" }],
    },
    {
        id: "video",
        name: "product-tour.mp4",
        folderId: "root",
        type: "video",
        src: landscapeImage,
        duration: "1:24",
        size: "38 MB",
        dimensions: "1920 × 1080",
        uploaded: "20.08.2026 by Max Mustermann",
        usedOn: [],
    },
    ...Array.from({ length: 6 }, (_, index): Asset => ({
        id: `product-${index + 1}`,
        name: `product-${index + 1}.jpg`,
        folderId: "products",
        type: "image",
        src: images[index % images.length],
        size: "1.8 MB",
        dimensions: "2000 × 1333",
        uploaded: "10.08.2026 by Anna Klein",
        alt: `Product shot ${index + 1}`,
        usedOn: [{ label: "Products", href: "#page-tree/products" }],
    })),
    {
        id: "team-offsite",
        name: "team-offsite.jpg",
        folderId: "team",
        type: "image",
        src: interiorImage,
        size: "2.8 MB",
        dimensions: "2400 × 1600",
        uploaded: "05.07.2026 by Lena Berger",
        alt: "The team at the offsite",
        usedOn: [{ label: "Team", href: "#page-tree/team" }],
    },
    ...newsArticles.slice(0, 6).map((article): Asset => ({
        id: `news-${article.id}`,
        name: `${article.id}.jpg`,
        folderId: "news-2026",
        type: "image",
        src: article.image,
        size: "1.6 MB",
        dimensions: "1600 × 1067",
        uploaded: `${article.date.split("-").reverse().join(".")} by ${article.author}`,
        alt: article.title,
        usedOn: [{ label: article.title, href: `#news/${article.id}` }],
    })),
    {
        id: "logo",
        name: "logo.svg",
        folderId: "brand",
        type: "image",
        src: portraitImage,
        size: "12 KB",
        uploaded: "01.01.2026 by Max Mustermann",
        alt: "Example Inc.",
        usedOn: [],
    },
    {
        id: "terms",
        name: "terms.pdf",
        folderId: "downloads",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        size: "220 KB",
        uploaded: "12.03.2026 by Lena Berger",
        usedOn: [{ label: "Imprint", href: "#page-tree/imprint" }],
    },
];

function findNavItem(items: SideNavItem[], id: string): SideNavItem | undefined {
    for (const item of items) {
        const found = item.id === id ? item : findNavItem(item.children ?? [], id);
        if (found) {
            return found;
        }
    }
    return undefined;
}

/** The label of a page of the prototype: an entry of the navigation, a page of the page tree (`page-tree/<id>`), or an article (`news/<id>`). */
export function getCmsPageLabel(pageId: string): string | undefined {
    const [section, id] = pageId.split("/");
    if (id == null) {
        return findNavItem(
            cmsNavGroups.flatMap((group) => group.items),
            section,
        )?.label;
    }
    if (section === "page-tree") {
        return findPage(id)?.label;
    }
    if (section === "news") {
        return id === "new" ? "New article" : findArticle(id)?.title;
    }
    return undefined;
}
