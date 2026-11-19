import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

export const MailHeadingBlock = {
    ...createTipTapRichTextBlock({
        textBlocks: [
            {
                name: "title",
                label: <FormattedMessage id="mail.heading.textBlock.title" defaultMessage="Title" />,
                tag: "h1",
                element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h1" {...props} />,
            },
            {
                name: "header",
                label: <FormattedMessage id="mail.heading.textBlock.header" defaultMessage="Header" />,
                tag: "h2",
                element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h2" {...props} />,
            },
        ],
    }),
    name: "MailHeading",
    displayName: <FormattedMessage id="mail.headingBlock.displayName" defaultMessage="Heading" />,
};
