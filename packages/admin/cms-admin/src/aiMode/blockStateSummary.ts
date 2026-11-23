import type { BlockInterface } from "../blocks/types";

type DamFileReference = {
    id: string;
    name: string;
};

type LinkReference = { pageTreeNodeId: string; name: string; path?: string } | { url: string } | { email: string } | { phone: string };

type VideoReference = {
    platform: "youtube" | "vimeo";
    identifier: string;
};

type BlockOutline = {
    key: string;
    type?: string;
    hidden?: true;
    files?: DamFileReference[];
    links?: LinkReference[];
    videos?: VideoReference[];
    blocks?: BlockOutline[];
};

type CollectResult = {
    blocks: BlockOutline[];
    files: DamFileReference[];
    links: LinkReference[];
    videos: VideoReference[];
};

const emptyResult: CollectResult = { blocks: [], files: [], links: [], videos: [] };

const mergeResults = (results: CollectResult[]): CollectResult => {
    return {
        blocks: results.flatMap((result) => result.blocks),
        files: results.flatMap((result) => result.files),
        links: results.flatMap((result) => result.links),
        videos: results.flatMap((result) => result.videos),
    };
};

const isChildBlockState = (value: object): value is { key: string; type?: unknown; visible?: unknown; props: unknown } => {
    return typeof (value as { key?: unknown }).key === "string" && "props" in value;
};

// Block states can embed React elements (e.g. a layout option's preview element), whose component
// objects are self-referential, and may contain class instances — neither must be walked.
const isPlainDataObject = (value: unknown): value is Record<string, unknown> => {
    if (value == null || typeof value !== "object" || "$$typeof" in value) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const isDamFile = (value: unknown): value is { id: string; name: string } => {
    return (
        value != null &&
        typeof value === "object" &&
        typeof (value as { id?: unknown }).id === "string" &&
        typeof (value as { name?: unknown }).name === "string"
    );
};

const isTargetPage = (value: unknown): value is { id: string; name: string; path?: string } => {
    return (
        value != null &&
        typeof value === "object" &&
        typeof (value as { id?: unknown }).id === "string" &&
        typeof (value as { name?: unknown }).name === "string"
    );
};

// A one-of block (e.g. media or a link) keeps the states of all its variants; only the active one is rendered.
const isOneOfBlockState = (value: object): value is { attachedBlocks: { type: string; props: unknown }[]; activeType?: string } => {
    return Array.isArray((value as { attachedBlocks?: unknown }).attachedBlocks) && "activeType" in value;
};

// Recognized by the active variant of the link block, because "email" and "phone" are names a block could also
// give a field that holds text rather than a link.
const toEmailOrPhoneLink = ({ type, props }: { type: string; props: unknown }): LinkReference | null => {
    if (type === "email" && isPlainDataObject(props) && typeof props.email === "string" && props.email.length > 0) {
        return { email: props.email };
    }
    if (type === "phone" && isPlainDataObject(props) && typeof props.phone === "string" && props.phone.length > 0) {
        return { phone: props.phone };
    }
    return null;
};

const deduplicate = <T>(references: T[]): T[] => {
    return [...new Map(references.map((reference) => [JSON.stringify(reference), reference])).values()];
};

const collectOutlines = (state: unknown, visited: WeakSet<object> = new WeakSet()): CollectResult => {
    if (Array.isArray(state)) {
        if (visited.has(state)) {
            return emptyResult;
        }
        visited.add(state);
        return mergeResults(state.map((item) => collectOutlines(item, visited)));
    }
    if (!isPlainDataObject(state) || visited.has(state)) {
        return emptyResult;
    }
    visited.add(state);
    if (isChildBlockState(state)) {
        const inner = collectOutlines(state.props, visited);
        const outline: BlockOutline = { key: state.key };
        if (typeof state.type === "string") {
            outline.type = state.type;
        }
        if (state.visible === false) {
            outline.hidden = true;
        }
        const files = deduplicate(inner.files);
        if (files.length > 0) {
            outline.files = files;
        }
        const links = deduplicate(inner.links);
        if (links.length > 0) {
            outline.links = links;
        }
        const videos = deduplicate(inner.videos);
        if (videos.length > 0) {
            outline.videos = videos;
        }
        if (inner.blocks.length > 0) {
            outline.blocks = inner.blocks;
        }
        return { blocks: [outline], files: [], links: [], videos: [] };
    }

    const results: CollectResult[] = [];
    for (const [propertyName, value] of Object.entries(state)) {
        if (propertyName === "damFile" && isDamFile(value)) {
            results.push({ ...emptyResult, files: [{ id: value.id, name: value.name }] });
        } else if (propertyName === "targetPage" && isTargetPage(value)) {
            results.push({
                ...emptyResult,
                links: [{ pageTreeNodeId: value.id, name: value.name, ...(typeof value.path === "string" ? { path: value.path } : {}) }],
            });
        } else if (propertyName === "targetUrl" && typeof value === "string" && value.length > 0) {
            results.push({ ...emptyResult, links: [{ url: value }] });
        } else if ((propertyName === "youtubeIdentifier" || propertyName === "vimeoIdentifier") && typeof value === "string" && value.length > 0) {
            results.push({ ...emptyResult, videos: [{ platform: propertyName === "youtubeIdentifier" ? "youtube" : "vimeo", identifier: value }] });
        } else if (propertyName === "attachedBlocks" && isOneOfBlockState(state)) {
            const activeBlock = state.attachedBlocks.find((attachedBlock) => attachedBlock.type === state.activeType);
            const linkReference = activeBlock ? toEmailOrPhoneLink(activeBlock) : null;
            if (linkReference) {
                results.push({ ...emptyResult, links: [linkReference] });
            } else if (activeBlock) {
                results.push(collectOutlines(activeBlock.props, visited));
            }
        } else {
            results.push(collectOutlines(value, visited));
        }
    }
    return mergeResults(results);
};

// The full block output of a page is easily tens of kilobytes of JSON (mostly styling, media metadata,
// and rich text internals), which overflows the agent's context. Reduce it to what the agent can act on:
// the block structure (so block keys can be matched against the selected block route), the referenced
// DAM files, link targets (pages, URLs, email addresses, phone numbers), and platform videos (usable with
// the MCP server's DAM and page tree tools), and the text contents.
export const summarizeBlockState = (block: BlockInterface, state: unknown) => {
    const { blocks, files, links, videos } = collectOutlines(state);
    return {
        blocks,
        ...(files.length > 0 ? { files } : {}),
        ...(links.length > 0 ? { links } : {}),
        ...(videos.length > 0 ? { videos } : {}),
        textContents: block.extractTextContents?.(state, { includeInvisibleContent: false }) ?? [],
    };
};

// The same keys the summary above reports, so a key the agent read there can be resolved back to a
// block.
export const collectBlockKeys = (state: unknown): string[] => {
    const keysOf = (outlines: BlockOutline[]): string[] => outlines.flatMap((outline) => [outline.key, ...keysOf(outline.blocks ?? [])]);
    return keysOf(collectOutlines(state).blocks);
};

const seoFieldNames = [
    "htmlTitle",
    "metaDescription",
    "openGraphTitle",
    "openGraphDescription",
    "canonicalUrl",
    "structuredData",
    "noIndex",
    "priority",
    "changeFrequency",
    "alternativeLinks",
] as const;

// The SEO block has no extractTextContents, so its fields would be missing from the generic summary
// even though they are prime material for the agent (e.g. "improve my meta description").
export const summarizeSeoBlockState = (block: BlockInterface, state: unknown) => {
    const summary = summarizeBlockState(block, state);
    if (!isPlainDataObject(state)) {
        return summary;
    }

    const seoFields: Record<string, unknown> = {};
    for (const fieldName of seoFieldNames) {
        const value = state[fieldName];
        if (value != null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
            seoFields[fieldName] = value;
        }
    }
    return { ...seoFields, ...summary };
};
