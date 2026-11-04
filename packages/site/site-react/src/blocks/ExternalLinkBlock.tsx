"use client";

import { type AnchorHTMLAttributes, cloneElement, type DetailedHTMLProps, type MouseEventHandler, type ReactElement } from "react";

import type { ExternalLinkBlockData } from "../blocks.generated";
import { usePreview } from "../preview/usePreview";
import { sendSitePreviewIFrameMessage } from "../sitePreview/iframebridge/sendSitePreviewIFrameMessage";
import { SitePreviewIFrameMessageType } from "../sitePreview/iframebridge/SitePreviewIFrameMessage";
import type { PropsWithData } from "./PropsWithData";

interface ExternalLinkBlockProps extends PropsWithData<ExternalLinkBlockData>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    children: ReactElement;
    legacyBehavior?: boolean;
}

export function ExternalLinkBlock({
    data: { targetUrl, openInNewWindow, noFollow },
    children,
    legacyBehavior,
    ...anchorProps
}: ExternalLinkBlockProps) {
    const preview = usePreview();

    if (preview.previewType === "SitePreview" || preview.previewType === "BlockPreview") {
        const onClick: MouseEventHandler = (event) => {
            event.preventDefault();
            if (preview.previewType === "SitePreview") {
                // send link to admin to handle external link
                sendSitePreviewIFrameMessage({
                    dextinityType: SitePreviewIFrameMessageType.OpenLink,
                    data: { link: { openInNewWindow, targetUrl, noFollow } },
                });
            }
        };

        if (legacyBehavior) {
            return cloneElement(children as ReactElement<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>>, {
                ...anchorProps,
                href: "#",
                onClick,
            });
        }

        return (
            <a {...anchorProps} href="#" onClick={onClick}>
                {children}
            </a>
        );
    } else {
        if (!targetUrl) {
            if (legacyBehavior) {
                return children;
            }

            return <span className={anchorProps.className}>{children}</span>;
        }

        const href = targetUrl;
        const target = openInNewWindow ? "_blank" : anchorProps.target;
        const rel = [anchorProps.rel, noFollow ? "nofollow" : undefined].filter(Boolean).join(" ") || undefined;

        if (legacyBehavior) {
            return cloneElement(children as ReactElement<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>>, {
                ...anchorProps,
                href,
                target,
                rel,
            });
        }

        return (
            <a {...anchorProps} href={href} target={target} rel={rel}>
                {children}
            </a>
        );
    }
}
