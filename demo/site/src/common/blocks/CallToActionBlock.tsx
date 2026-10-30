"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { CallToActionBlockData } from "@src/blocks.generated";
import { filesize } from "filesize";

import { Button, type ButtonVariant } from "../components/Button";
import { HiddenIfInvalidLink } from "../helpers/HiddenIfInvalidLink";
import { LinkBlock } from "./LinkBlock";

const buttonVariantMap: Record<CallToActionBlockData["variant"], ButtonVariant> = {
    contained: "contained",
    outlined: "outlined",
    text: "text",
};

export const CallToActionBlock = withPreview(
    ({ data: { textLink, variant } }: PropsWithData<CallToActionBlockData>) => {
        const linkBlock = textLink.link.block;
        let buttonText = textLink.text;
        if (linkBlock && linkBlock.type === "damFileDownload" && "file" in linkBlock.props && linkBlock.props.file) {
            buttonText = `${buttonText} (${filesize(linkBlock?.props.file?.size)})`;
        }
        return (
            <HiddenIfInvalidLink link={textLink.link}>
                <Button as={LinkBlock} data={textLink.link} variant={buttonVariantMap[variant]}>
                    {buttonText}
                </Button>
            </HiddenIfInvalidLink>
        );
    },
    { label: "Call To Action" },
);
