import type {
    DamFileDownloadLinkBlockData,
    EmailLinkBlockData,
    ExternalLinkBlockData,
    InternalLinkBlockData,
    LinkBlockData,
    PhoneLinkBlockData,
} from "@src/blocks.generated";

export const isValidLink = (link: LinkBlockData) => {
    return Boolean(
        link.block &&
        ((link.block.type === "internal" && (link.block.props as InternalLinkBlockData).targetPage) ||
            (link.block.type === "external" && (link.block.props as ExternalLinkBlockData).targetUrl) ||
            (link.block.type === "damFileDownload" && (link.block.props as DamFileDownloadLinkBlockData).file) ||
            (link.block.type === "email" && (link.block.props as EmailLinkBlockData).email) ||
            (link.block.type === "phone" && (link.block.props as PhoneLinkBlockData).phone)),
    );
};
