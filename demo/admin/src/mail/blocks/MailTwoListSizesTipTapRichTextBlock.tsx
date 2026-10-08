import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

const smallStyle = {
    name: "small",
    label: <FormattedMessage id="mail.twoListSizesTipTapRichText.textBlockStyle.small" defaultMessage="Small" />,
    element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="body2" {...props} />,
};

export const MailTwoListSizesTipTapRichTextBlock = {
    ...createTipTapRichTextBlock({
        link: MailLinkBlock,
        textBlocks: [
            {
                name: "paragraph",
                label: <FormattedMessage id="mail.twoListSizesTipTapRichText.textBlock.paragraph" defaultMessage="Paragraph" />,
                tag: "p",
                styles: [smallStyle],
            },
        ],
        orderedList: { styles: [smallStyle] },
        unorderedList: { styles: [smallStyle] },
    }),
    displayName: <FormattedMessage id="mail.twoListSizesTipTapRichText.displayName" defaultMessage="Rich Text (TipTap, Two List Sizes)" />,
};
