export type AssetKind = "image" | "video" | "audio" | "document";

export type AssetCrop = "free" | "16:9" | "4:3" | "1:1";

export interface LibraryFolder {
    id: string;
    name: string;
    parentId: string | null;
    modified: string;
}

export interface AssetUsage {
    page: string;
    path: string;
    block: string;
    href: string;
}

export interface LibraryAsset {
    id: string;
    name: string;
    folderId: string;
    kind: AssetKind;
    /** The thumbnail, and the image itself for images. */
    src: string;
    width?: number;
    height?: number;
    /** Seconds, for video and audio. */
    duration?: number;
    pages?: number;
    /** A document whose pages are landscape, e.g. a presentation. */
    landscape?: boolean;
    bytes: number;
    modified: string;
    uploadedBy: string;
    usages: AssetUsage[];
    archived: boolean;
    aiGenerated: boolean;
    alt: string;
    title: string;
    copyright: string;
    focalPoint: { x: number; y: number };
    focalPointAuto: boolean;
    crop: AssetCrop;
    /** Assets with identical content share a key. */
    contentHash: string;
}

/** The prototype's "today", so that relative dates stay stable. */
export const today = "2026-11-19";

function svgDataUri(svg: string) {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** A landscape photo stand-in in the image's own aspect ratio: sky, sun, and two ranges of hills. */
/** With `transparent`, only the hills are drawn, so that the checkerboard behind a transparent image shows. */
function photo(hue: number, width: number, height: number, variant = 0, transparent = false) {
    const w = 600;
    const h = Math.round((600 * height) / width);
    const sunX = [0.25, 0.7, 0.5, 0.82][variant % 4] * w;
    const ridge = (base: number, amplitude: number, phase: number) => {
        const points = Array.from({ length: 7 }, (_, index) => {
            const x = (index / 6) * w;
            const y = h * base - Math.sin(index * 1.3 + phase) * h * amplitude;
            return `${x.toFixed(0)},${y.toFixed(0)}`;
        });
        return `0,${h} ${points.join(" ")} ${w},${h}`;
    };
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${hue + 30} 80% 84%)"/></linearGradient></defs>${transparent ? "" : `<rect width="${w}" height="${h}" fill="url(#s)"/><circle cx="${sunX}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.09}" fill="hsl(${hue + 160} 90% 92%)"/>`}<polygon points="${ridge(0.62, 0.14, variant)}" fill="hsl(${hue + 120} 30% 42%)"/><polygon points="${ridge(0.8, 0.08, variant + 2)}" fill="hsl(${hue + 140} 35% 26%)"/></svg>`,
    );
}

function documentSheet(hue: number, landscape = false) {
    const [w, h] = landscape ? [400, 300] : [300, 400];
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/><rect x="24" y="28" width="${w * 0.45}" height="14" rx="3" fill="hsl(${hue} 60% 45%)"/>${Array.from({ length: landscape ? 8 : 14 }, (_, index) => `<rect x="24" y="${64 + index * 20}" width="${(index % 3 === 2 ? 0.55 : 0.84) * (w - 48)}" height="7" rx="3" fill="#d6d9e0"/>`).join("")}</svg>`,
    );
}

function waveform(hue: number) {
    const bars = Array.from({ length: 48 }, (_, index) => {
        const height = 20 + Math.abs(Math.sin(index * 1.7) * 50 + Math.cos(index * 0.6) * 20);
        return `<rect x="${12 + index * 12}" y="${100 - height}" width="6" height="${height * 2}" rx="3" fill="hsl(${hue} 70% 60%)"/>`;
    });
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200"><rect width="600" height="200" fill="hsl(${hue} 60% 95%)"/>${bars.join("")}</svg>`,
    );
}

export const libraryFolders: LibraryFolder[] = [
    { id: "campaigns", name: "Campaigns", parentId: null, modified: "2026-11-12" },
    { id: "campaigns-autumn", name: "Autumn campaign 2026", parentId: "campaigns", modified: "2026-11-12" },
    { id: "campaigns-spring", name: "Spring campaign 2026", parentId: "campaigns", modified: "2026-03-02" },
    { id: "imagery", name: "Imagery", parentId: null, modified: "2026-11-18" },
    { id: "mountains", name: "Mountains & lakes", parentId: "imagery", modified: "2026-11-19" },
    { id: "cities", name: "Cities", parentId: "imagery", modified: "2026-10-14" },
    { id: "nature", name: "Nature", parentId: "imagery", modified: "2026-09-30" },
    { id: "team", name: "Team & people", parentId: null, modified: "2026-11-05" },
    { id: "management", name: "Management", parentId: "team", modified: "2026-08-21" },
    { id: "office", name: "Office life", parentId: "team", modified: "2026-11-05" },
    { id: "brand", name: "Brand & logos", parentId: null, modified: "2026-06-11" },
    { id: "press", name: "Press", parentId: null, modified: "2026-10-02" },
    { id: "press-kits", name: "Press kits 2026", parentId: "press", modified: "2026-10-02" },
    { id: "products", name: "Products", parentId: null, modified: "2026-10-28" },
    { id: "product-cms", name: "Content management", parentId: "products", modified: "2026-10-28" },
    { id: "product-commerce", name: "Commerce", parentId: "products", modified: "2026-09-17" },
    { id: "product-analytics", name: "Analytics", parentId: "products", modified: "2026-07-09" },
    { id: "audio", name: "Audio", parentId: null, modified: "2026-09-01" },
    { id: "podcast", name: "Podcast & jingles", parentId: "audio", modified: "2026-09-01" },
    { id: "video", name: "Video", parentId: null, modified: "2026-11-18" },
    { id: "documents", name: "Documents", parentId: null, modified: "2026-10-20" },
    { id: "demo", name: "Demo", parentId: null, modified: "2026-11-20" },
    { id: "price-lists", name: "Price lists", parentId: "documents", modified: "2026-10-20" },
    { id: "legal", name: "Legal", parentId: "documents", modified: "2026-05-04" },
];

const pages = {
    home: { page: "Home", path: "/", href: "#page-tree/home" },
    products: { page: "Products", path: "/products", href: "#page-tree/products" },
    cms: { page: "Content management", path: "/products/content-management", href: "#page-tree/cms" },
    commerce: { page: "Commerce", path: "/products/commerce", href: "#page-tree/commerce" },
    about: { page: "About us", path: "/about-us", href: "#page-tree/about" },
    team: { page: "Team", path: "/about-us/team", href: "#page-tree/team" },
    locations: { page: "Locations", path: "/about-us/locations", href: "#page-tree/locations" },
    newsroom: { page: "Newsroom", path: "/news", href: "#page-tree/newsroom" },
    contact: { page: "Contact", path: "/contact", href: "#page-tree/contact" },
};

type PageKey = keyof typeof pages;

function uses(...entries: [PageKey, string][]): AssetUsage[] {
    return entries.map(([page, block]) => ({ ...pages[page], block }));
}

const editors = ["Anna Klein", "Max Mustermann", "Lena Berger"];

let nextHue = 200;

interface AssetInput {
    name: string;
    folderId: string;
    usages?: AssetUsage[];
    archived?: boolean;
    aiGenerated?: boolean;
    alt?: string;
    modified?: string;
    contentHash?: string;
}

function base(input: AssetInput, index: number) {
    return {
        id: input.name
            .replace(/\.[a-z0-9]+$/i, "")
            .replace(/[^a-z0-9]+/gi, "-")
            .toLowerCase(),
        name: input.name,
        folderId: input.folderId,
        usages: input.usages ?? [],
        archived: input.archived ?? false,
        aiGenerated: input.aiGenerated ?? false,
        alt: input.alt ?? "",
        title: "",
        copyright: "© Example Inc.",
        modified: input.modified ?? `2026-${String(11 - (index % 6)).padStart(2, "0")}-${String(2 + ((index * 7) % 26)).padStart(2, "0")}`,
        uploadedBy: editors[index % editors.length],
        focalPoint: { x: 0.5, y: 0.45 },
        focalPointAuto: true,
        crop: "free" as const,
        contentHash: input.contentHash ?? input.name,
    };
}

function image(input: AssetInput & { width: number; height: number; variant?: number; transparent?: boolean }, index: number): LibraryAsset {
    nextHue = (nextHue + 47) % 360;
    return {
        ...base(input, index),
        kind: "image",
        src: photo(nextHue, input.width, input.height, input.variant ?? index, input.transparent),
        width: input.width,
        height: input.height,
        bytes: Math.round(((input.width * input.height) / 6.5) * (0.35 + ((index * 37) % 100) / 80) + 140_000),
    };
}

function video(input: AssetInput & { duration: number; width?: number; height?: number }, index: number): LibraryAsset {
    nextHue = (nextHue + 47) % 360;
    const { width = 1920, height = 1080 } = input;
    return {
        ...base(input, index),
        kind: "video",
        src: photo(nextHue, width, height, index),
        width,
        height,
        duration: input.duration,
        bytes: input.duration * 1_450_000,
    };
}

function audio(input: AssetInput & { duration: number }, index: number): LibraryAsset {
    return { ...base(input, index), kind: "audio", src: waveform(250 + index * 20), duration: input.duration, bytes: input.duration * 64_000 };
}

function documentAsset(input: AssetInput & { pages: number; landscape?: boolean }, index: number): LibraryAsset {
    return {
        ...base(input, index),
        kind: "document",
        src: documentSheet(200 + index * 30, input.landscape),
        pages: input.pages,
        landscape: input.landscape,
        bytes: input.pages * 380_000 + 90_000,
    };
}

const mountainNames = [
    "aerial-photo-of-mountains.jpg",
    "austria-beach-dawn-dusk.jpg",
    "drone-shot-of-an-island.jpg",
    "gray-road-and-green-mountains.jpg",
    "green-field-near-mountain.jpg",
    "man-standing-on-cliff.jpg",
    "mountain-surrounded-with-fog.jpg",
    "mountains-and-trees.jpg",
    "mountains-covered-with-snow.jpg",
    "photo-of-mountain.jpg",
    "road-leading-to-mountain.jpg",
    "rock-formation-by-the-sea.jpg",
    "scenic-lake-at-sunset.jpg",
    "waterfall-near-forest.jpg",
];

const inputs: ((index: number) => LibraryAsset)[] = [
    ...mountainNames.map(
        (name, position) => (index: number) =>
            image(
                {
                    name,
                    folderId: "mountains",
                    width: position % 4 === 3 ? 4000 : 6000,
                    height: position % 4 === 3 ? 6000 : 4000,
                    alt: position < 2 ? "Mountains above a lake in the morning light" : "",
                    usages: position === 1 ? uses(["home", "Stage"]) : position === 4 ? uses(["products", "Image"], ["about", "Teaser"]) : [],
                    modified: position === 3 ? today : position === 2 ? "2026-11-18" : undefined,
                    contentHash: position === 9 ? "mountain" : undefined,
                },
                index,
            ),
    ),
    (index) => image({ name: "photo-of-mountain-copy.jpg", folderId: "campaigns-spring", width: 6000, height: 4000, contentHash: "mountain" }, index),
    ...["vienna-skyline.jpg", "street-in-graz.jpg", "linz-at-night.jpg", "salzburg-old-town.jpg", "city-bridge.jpg"].map(
        (name, position) => (index: number) =>
            image(
                {
                    name,
                    folderId: "cities",
                    width: 5000,
                    height: 3333,
                    alt: position % 2 === 0 ? `Photo: ${name.replace(/-/g, " ").replace(".jpg", "")}` : "",
                    usages: position === 0 ? uses(["locations", "Stage"]) : [],
                },
                index,
            ),
    ),
    ...["photo-of-green-leaves.jpg", "trees-in-autumn-forest.jpg", "meadow-with-flowers.jpg", "river-in-the-woods.jpg", "moss-on-stones.jpg"].map(
        (name, position) => (index: number) =>
            image(
                { name, folderId: "nature", width: 3000, height: position === 1 ? 3000 : 4500, aiGenerated: position === 1, alt: "Nature close-up" },
                index,
            ),
    ),
    (index) => image({ name: "old-forest-header.jpg", folderId: "nature", width: 4000, height: 2000, archived: true, alt: "Forest" }, index),
    (index) =>
        image(
            {
                name: "a-joyful-woman-standing-near-building.jpg",
                folderId: "management",
                width: 5760,
                height: 3840,
                alt: "Laughing woman with a laptop in front of an office building.",
                usages: uses(["team", "Stage"], ["about", "Image"], ["home", "Two columns"], ["newsroom", "Teaser"]),
            },
            index,
        ),
    (index) =>
        image(
            {
                name: "ceo-portrait.jpg",
                folderId: "management",
                width: 3000,
                height: 4000,
                alt: "Portrait of the CEO",
                usages: uses(["team", "Image"]),
            },
            index,
        ),
    (index) => image({ name: "board-meeting.jpg", folderId: "management", width: 5000, height: 3333 }, index),
    ...["team-offsite.jpg", "coffee-corner.jpg", "standup-meeting.jpg", "office-vienna.jpg"].map(
        (name, position) => (index: number) =>
            image(
                {
                    name,
                    folderId: "office",
                    width: 4800,
                    height: 3200,
                    alt: position === 0 ? "The team at the offsite" : "",
                    usages: position === 3 ? uses(["about", "Image"], ["contact", "Stage"]) : [],
                },
                index,
            ),
    ),
    (index) => image({ name: "office-2019.jpg", folderId: "office", width: 3000, height: 2000, archived: true, alt: "The old office" }, index),
    ...["logo.svg", "logo-white.svg", "brand-pattern.png", "favicon.png"].map(
        (name, position) => (index: number) =>
            image(
                {
                    name,
                    folderId: "brand",
                    width: position === 3 ? 512 : 2400,
                    height: position === 3 ? 512 : 1200,
                    alt: "Example Inc.",
                    usages: position === 0 ? uses(["home", "Stage"], ["contact", "Image"]) : [],
                },
                index,
            ),
    ),
    (index) => documentAsset({ name: "press-release-spring.pdf", folderId: "press-kits", pages: 3, usages: uses(["newsroom", "Teaser"]) }, index),
    (index) => documentAsset({ name: "company-presentation.pdf", folderId: "press-kits", pages: 12, landscape: true }, index),
    (index) =>
        image(
            {
                name: "autumn-key-visual.jpg",
                folderId: "campaigns-autumn",
                width: 6000,
                height: 4000,
                aiGenerated: true,
                alt: "Autumn leaves",
                usages: uses(["home", "Teaser"]),
            },
            index,
        ),
    (index) => image({ name: "autumn-banner.jpg", folderId: "campaigns-autumn", width: 4000, height: 1200, alt: "" }, index),
    (index) => image({ name: "spring-hero.jpg", folderId: "campaigns-spring", width: 6000, height: 4000, alt: "Blossoms in spring" }, index),
    (index) => video({ name: "spring-teaser.mp4", folderId: "campaigns-spring", duration: 13, usages: uses(["home", "Stage"]) }, index),
    ...["cms-dashboard.png", "cms-page-tree.png"].map(
        (name) => (index: number) =>
            image(
                { name, folderId: "product-cms", width: 2880, height: 1800, alt: "Screenshot of the admin", usages: uses(["cms", "Image"]) },
                index,
            ),
    ),
    ...["shop-checkout.png", "shop-products.png"].map(
        (name) => (index: number) =>
            image({ name, folderId: "product-commerce", width: 2880, height: 1800, usages: uses(["commerce", "Image"]) }, index),
    ),
    ...["analytics-report.png", "analytics-funnel.png"].map(
        (name) => (index: number) => image({ name, folderId: "product-analytics", width: 2880, height: 1800, aiGenerated: true }, index),
    ),
    (index) => audio({ name: "podcast-episode-12.mp3", folderId: "podcast", duration: 1834, usages: uses(["newsroom", "Teaser"]) }, index),
    (index) => audio({ name: "jingle-short.wav", folderId: "podcast", duration: 34 }, index),
    (index) => audio({ name: "hold-music.mp3", folderId: "podcast", duration: 142, aiGenerated: true }, index),
    (index) =>
        video({ name: "product-tour.mp4", folderId: "video", duration: 84, usages: uses(["products", "Stage"], ["cms", "Two columns"]) }, index),
    (index) => video({ name: "customer-story.mp4", folderId: "video", duration: 212 }, index),
    (index) => video({ name: "event-recap-2026.mp4", folderId: "video", duration: 96, modified: "2026-11-18" }, index),
    (index) => documentAsset({ name: "price-list-2026.pdf", folderId: "price-lists", pages: 4, usages: uses(["products", "Teaser"]) }, index),
    (index) => documentAsset({ name: "price-list-2025.pdf", folderId: "price-lists", pages: 4 }, index),
    (index) => documentAsset({ name: "terms-and-conditions.pdf", folderId: "legal", pages: 6, usages: uses(["contact", "Teaser"]) }, index),
    (index) => documentAsset({ name: "privacy-policy.pdf", folderId: "legal", pages: 5 }, index),
    (index) => documentAsset({ name: "brand-guidelines.pdf", folderId: "documents", pages: 24, landscape: true }, index),
    // The demo folder: one file per format, named after it, to test the detail page's preview with
    ...(
        [
            ["landscape-3x2-6000x4000.jpg", 6000, 4000],
            ["landscape-4x3-4000x3000.jpg", 4000, 3000],
            ["landscape-16x9-1920x1080.jpg", 1920, 1080],
            ["ultrawide-21x9-5040x2160.jpg", 5040, 2160],
            ["panorama-10x3-4000x1200.jpg", 4000, 1200],
            ["square-1x1-3000x3000.jpg", 3000, 3000],
            ["portrait-3x4-3000x4000.jpg", 3000, 4000],
            ["portrait-2x3-4000x6000.jpg", 4000, 6000],
            ["portrait-9x16-1080x1920.jpg", 1080, 1920],
            ["small-icon-128x128.png", 128, 128],
        ] as const
    ).map(
        ([name, width, height]) =>
            (index: number) =>
                image({ name, folderId: "demo", width, height, alt: `Test image, ${width} × ${height}`, modified: "2026-11-20" }, index),
    ),
    (index) =>
        image(
            {
                name: "transparent-png-2400x1200.png",
                folderId: "demo",
                width: 2400,
                height: 1200,
                transparent: true,
                alt: "Test image with transparency",
                modified: "2026-11-20",
            },
            index,
        ),
    (index) => documentAsset({ name: "document-portrait-a4-3-pages.pdf", folderId: "demo", pages: 3, modified: "2026-11-20" }, index),
    (index) =>
        documentAsset(
            { name: "document-landscape-slides-12-pages.pdf", folderId: "demo", pages: 12, landscape: true, modified: "2026-11-20" },
            index,
        ),
    (index) => video({ name: "video-landscape-16x9-0-42.mp4", folderId: "demo", duration: 42, modified: "2026-11-20" }, index),
    (index) =>
        video({ name: "video-portrait-9x16-0-15.mp4", folderId: "demo", duration: 15, width: 1080, height: 1920, modified: "2026-11-20" }, index),
    (index) => audio({ name: "audio-0-34.wav", folderId: "demo", duration: 34, modified: "2026-11-20" }, index),
];

export const libraryAssets: LibraryAsset[] = inputs.map((create, index) => create(index));

export function getFolder(folders: LibraryFolder[], id: string | null) {
    return folders.find((folder) => folder.id === id);
}

/** The folders from the root down to the folder, without the root. */
export function getFolderTrail(folders: LibraryFolder[], id: string | null): LibraryFolder[] {
    const folder = getFolder(folders, id);
    return folder == null ? [] : [...getFolderTrail(folders, folder.parentId), folder];
}

export function getDescendantFolderIds(folders: LibraryFolder[], id: string | null): string[] {
    return folders.filter((folder) => folder.parentId === id).flatMap((folder) => [folder.id, ...getDescendantFolderIds(folders, folder.id)]);
}

export function formatBytes(bytes: number) {
    return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

export function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function formatModified(isoDate: string) {
    const days = Math.round((Date.parse(today) - Date.parse(isoDate)) / 86_400_000);
    if (days === 0) {
        return "Today";
    }
    if (days === 1) {
        return "Yesterday";
    }
    return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const kindLabels: Record<AssetKind, string> = { image: "Image", video: "Video", audio: "Audio", document: "Document" };

export function getExtension(name: string) {
    return name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toUpperCase() : "";
}

/** The short description below a tile, e.g. "Image, 6000 × 4000" or "PDF, 4 pages". */
export function describeAsset(asset: LibraryAsset) {
    switch (asset.kind) {
        case "image":
            return `Image, ${asset.width} × ${asset.height}`;
        case "video":
            return `Video, ${formatDuration(asset.duration ?? 0)}`;
        case "audio":
            return `Audio, ${formatDuration(asset.duration ?? 0)}`;
        case "document":
            return `${getExtension(asset.name)}, ${asset.pages} ${asset.pages === 1 ? "page" : "pages"}`;
    }
}
