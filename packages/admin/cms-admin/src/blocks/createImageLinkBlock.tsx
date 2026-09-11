import { FormattedMessage, type MessageDescriptor } from "react-intl";

import { createCompositeBlock } from "./factories/createCompositeBlock";
import { PixelImageBlock } from "./PixelImageBlock";
import type { BlockInterface } from "./types";

interface CreateImageLinkBlockOptions {
    link: BlockInterface;
    image?: BlockInterface;
    name?: string;
    tags?: Array<MessageDescriptor | string>;
}

export function createImageLinkBlock(
    { link: LinkBlock, image = PixelImageBlock, name = "ImageLink", tags }: CreateImageLinkBlockOptions,
    override?: (block: BlockInterface) => BlockInterface,
): BlockInterface {
    return createCompositeBlock(
        {
            name,
            displayName: <FormattedMessage id="dextinity.blocks.imageLink" defaultMessage="Image/Link" />,
            blocks: {
                link: {
                    block: LinkBlock,
                    title: <FormattedMessage id="dextinity.blocks.imageLink.link" defaultMessage="Link" />,
                    paper: true,
                },
                image: {
                    block: image,
                    title: <FormattedMessage id="dextinity.blocks.imageLink.image" defaultMessage="Image" />,
                    paper: true,
                },
            },
            tags,
        },
        override,
    );
}
