import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

export const mailRichTextBlockOptions = {
    link: MailLinkBlock,
    textBlocks: [
        {
            name: "paragraph",
            label: <FormattedMessage id="mail.richText.textBlock.paragraph" defaultMessage="Paragraph" />,
            tag: "p",
            styles: [
                {
                    name: "title",
                    label: <FormattedMessage id="mail.richText.textBlockStyle.title" defaultMessage="Title" />,
                    element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h1" {...props} />,
                },
                {
                    name: "header",
                    label: <FormattedMessage id="mail.richText.textBlockStyle.header" defaultMessage="Header" />,
                    element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h2" {...props} />,
                },
                {
                    name: "small",
                    label: <FormattedMessage id="mail.richText.textBlockStyle.small" defaultMessage="Small" />,
                    element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="body2" {...props} />,
                },
            ],
        },
    ],
} satisfies NonNullable<Parameters<typeof createTipTapRichTextBlock>[0]>;

export const MailRichTextBlock = {
    ...createTipTapRichTextBlock(mailRichTextBlockOptions),
    name: "MailRichText",
    displayName: <FormattedMessage id="mail.richText.displayName" defaultMessage="Rich Text" />,
};
