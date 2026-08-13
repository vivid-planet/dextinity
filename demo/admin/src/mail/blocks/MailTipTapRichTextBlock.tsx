import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

const mailTipTapRichTextBlockOptions = {
    link: MailLinkBlock,
    supports: ["history", "bold", "italic", "sub", "sup", "strike", "unordered-list", "ordered-list", "non-breaking-space", "soft-hyphen"],
    // The mail theme has one text variant per style, so styles take the place of the editor's heading levels.
    textBlockStyles: [
        {
            name: "title",
            label: <FormattedMessage id="mail.tipTapRichText.textBlockStyle.title" defaultMessage="Title" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h1" {...props} />,
        },
        {
            name: "header",
            label: <FormattedMessage id="mail.tipTapRichText.textBlockStyle.header" defaultMessage="Header" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h2" {...props} />,
        },
    ],
} satisfies NonNullable<Parameters<typeof createTipTapRichTextBlock>[0]>;

export const MailTipTapRichTextBlock = {
    ...createTipTapRichTextBlock(mailTipTapRichTextBlockOptions),
    displayName: <FormattedMessage id="mail.tipTapRichText.displayName" defaultMessage="Rich Text (TipTap)" />,
};
