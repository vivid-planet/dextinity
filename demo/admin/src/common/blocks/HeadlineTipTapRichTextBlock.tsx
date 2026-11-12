import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const HeadlineTipTapRichTextBlock = {
    ...createTipTapRichTextBlock({
        strike: false,
        textBlocks: [
            { name: "headline600", tag: "h1", label: <FormattedMessage id="headingBlock.size600" defaultMessage="Size 600" /> },
            { name: "headline550", tag: "h2", label: <FormattedMessage id="headingBlock.size550" defaultMessage="Size 550" /> },
            { name: "headline500", tag: "h3", label: <FormattedMessage id="headingBlock.size500" defaultMessage="Size 500" /> },
            { name: "headline450", tag: "h4", label: <FormattedMessage id="headingBlock.size450" defaultMessage="Size 450" /> },
            { name: "headline400", tag: "h5", label: <FormattedMessage id="headingBlock.size400" defaultMessage="Size 400" /> },
            { name: "headline350", tag: "h6", label: <FormattedMessage id="headingBlock.size350" defaultMessage="Size 350" /> },
        ],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "HeadlineTipTapRichText",
};
