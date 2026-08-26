"use client";
import {
    DamFileDownloadLinkBlock,
    EmailLinkBlock,
    ExternalLinkBlock,
    OneOfBlock,
    PhoneLinkBlock,
    type PropsWithData,
    type SupportedBlocks,
    withPreview,
} from "@dextinity/site-nextjs";
import type { LinkBlockData } from "@src/blocks.generated";
import { NewsLinkBlock } from "@src/news/blocks/NewsLinkBlock";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

import { InternalLinkBlock } from "./InternalLinkBlock";

interface LinkBlockProps extends PropsWithChildren<PropsWithData<LinkBlockData>>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {}

export const LinkBlock = withPreview(
    ({ data, children, ...anchorProps }: LinkBlockProps) => {
        const supportedBlocks: SupportedBlocks = {
            internal: ({ children, ...props }) => (
                <InternalLinkBlock data={props} {...anchorProps}>
                    {children}
                </InternalLinkBlock>
            ),
            external: ({ children, ...props }) => (
                <ExternalLinkBlock data={props} {...anchorProps}>
                    {children}
                </ExternalLinkBlock>
            ),
            news: ({ children, ...props }) => (
                <NewsLinkBlock data={props} {...anchorProps}>
                    {children}
                </NewsLinkBlock>
            ),
            damFileDownload: ({ children, ...props }) => (
                <DamFileDownloadLinkBlock data={props} {...anchorProps}>
                    {children}
                </DamFileDownloadLinkBlock>
            ),
            email: ({ children, ...props }) => (
                <EmailLinkBlock data={props} {...anchorProps}>
                    {children}
                </EmailLinkBlock>
            ),
            phone: ({ children, ...props }) => (
                <PhoneLinkBlock data={props} {...anchorProps}>
                    {children}
                </PhoneLinkBlock>
            ),
        };

        return (
            <OneOfBlock data={data} supportedBlocks={supportedBlocks}>
                {children}
            </OneOfBlock>
        );
    },
    { label: "Link" },
);
