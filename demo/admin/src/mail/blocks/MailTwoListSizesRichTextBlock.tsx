import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

const smallStyle = {
    name: "small",
    label: <FormattedMessage id="mail.twoListSizesRichText.textBlockStyle.small" defaultMessage="Small" />,
    element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="body2" {...props} />,
};

export const MailTwoListSizesRichTextBlock = {
    ...createTipTapRichTextBlock({
        link: MailLinkBlock,
        textBlocks: [
            {
                name: "paragraph",
                label: <FormattedMessage id="mail.twoListSizesRichText.textBlock.paragraph" defaultMessage="Paragraph" />,
                tag: "p",
                styles: [smallStyle],
            },
        ],
        orderedList: { styles: [smallStyle] },
        unorderedList: { styles: [smallStyle] },
    }),
    name: "MailTwoListSizesRichText",
    displayName: <FormattedMessage id="mail.twoListSizesRichText.displayName" defaultMessage="Rich Text (Two List Sizes)" />,
};
