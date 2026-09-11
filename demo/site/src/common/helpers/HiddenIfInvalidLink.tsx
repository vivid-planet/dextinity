import { usePreview } from "@dextinity/site-nextjs";
import type {
    DamFileDownloadLinkBlockData,
    EmailLinkBlockData,
    ExternalLinkBlockData,
    InternalLinkBlockData,
    LinkBlockData,
    PhoneLinkBlockData,
} from "@src/blocks.generated";
import type { PropsWithChildren } from "react";

export function HiddenIfInvalidLink({ link, children }: PropsWithChildren<{ link: LinkBlockData }>) {
    const { previewType } = usePreview();

    if (previewType === "BlockPreview") {
        return <>{children}</>;
    }

    if (!isValidLink(link)) {
        return null;
    }

    return <>{children}</>;
}

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
