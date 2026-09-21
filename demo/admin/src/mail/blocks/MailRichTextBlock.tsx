import { createRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import { FormattedMessage } from "react-intl";

export const MailRichTextBlock = createRichTextBlock({
    link: MailLinkBlock,
    rte: {
        supports: [
            "bold",
            "italic",
            "sub",
            "sup",
            "strikethrough",
            "unordered-list",
            "ordered-list",
            "history",
            "link",
            "links-remove",
            "non-breaking-space",
            "soft-hyphen",
        ],
        standardBlockType: "copy",
        blocktypeMap: {
            title: {
                label: <FormattedMessage id="mail.richText.blockType.title" defaultMessage="Title" />,
                renderConfig: {
                    element: (props) => <Typography variant="h1" {...props} />,
                },
            },
            header: {
                label: <FormattedMessage id="mail.richText.blockType.header" defaultMessage="Header" />,
                renderConfig: {
                    element: (props) => <Typography variant="h2" {...props} />,
                },
            },
            copy: { label: <FormattedMessage id="mail.richText.blockType.copy" defaultMessage="Copy" /> },
        },
    },
});
