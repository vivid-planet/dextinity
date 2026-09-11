import { createRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import { FormattedMessage } from "react-intl";

export const MailTwoListSizesRichTextBlock = createRichTextBlock(
    {
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
                copy: { label: <FormattedMessage id="mail.twoListSizesRichText.blockType.copy" defaultMessage="Copy (Default)" /> },
                "copy-small": {
                    label: <FormattedMessage id="mail.twoListSizesRichText.blockType.copySmall" defaultMessage="Copy (Small)" />,
                    renderConfig: { element: (props) => <Typography paragraph variant="body2" {...props} /> },
                },
                // The built-in list types are toolbar buttons unless `group` moves them into the block-type select.
                "unordered-list-item": {
                    label: <FormattedMessage id="mail.twoListSizesRichText.blockType.unorderedList" defaultMessage="Unordered List (Default)" />,
                    group: "dropdown",
                },
                "unordered-list-item-small": {
                    label: <FormattedMessage id="mail.twoListSizesRichText.blockType.unorderedListSmall" defaultMessage="Unordered List (Small)" />,
                    renderConfig: { wrapper: <Typography variant="body2" component="ul" className="public-DraftStyleDefault-ul" />, element: "li" },
                },
                "ordered-list-item": {
                    label: <FormattedMessage id="mail.twoListSizesRichText.blockType.orderedList" defaultMessage="Ordered List (Default)" />,
                    group: "dropdown",
                },
                "ordered-list-item-small": {
                    label: <FormattedMessage id="mail.twoListSizesRichText.blockType.orderedListSmall" defaultMessage="Ordered List (Small)" />,
                    renderConfig: { wrapper: <Typography variant="body2" component="ol" className="public-DraftStyleDefault-ol" />, element: "li" },
                },
            },
        },
    },
    (block) => ({
        ...block,
        name: "MailTwoListSizesRichText",
        displayName: <FormattedMessage id="mail.twoListSizesRichText.displayName" defaultMessage="Rich Text (Two List Sizes)" />,
    }),
);
