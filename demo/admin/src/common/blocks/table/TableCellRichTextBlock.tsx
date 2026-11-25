import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { listStyles, textStyleSx } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

export const TableCellRichTextBlock = {
    ...createTipTapRichTextBlock({
        link: LinkBlock,
        textBlocks: [
            {
                name: "paragraph",
                tag: "p",
                label: <FormattedMessage id="richTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
                styles: [
                    {
                        name: "paragraph300",
                        label: <FormattedMessage id="richTextBlock.paragraph300" defaultMessage="Paragraph" />,
                        element: (props, tag) => <Typography component={tag} sx={textStyleSx(18, 26)} {...props} />,
                    },
                    {
                        name: "paragraph200",
                        label: <FormattedMessage id="richTextBlock.paragraph200" defaultMessage="Paragraph Small" />,
                        element: (props, tag) => <Typography component={tag} sx={textStyleSx(15, 22)} {...props} />,
                    },
                ],
                defaultStyle: "paragraph300",
            },
        ],
        orderedList: { styles: listStyles, defaultStyle: "list300" },
        unorderedList: { styles: listStyles, defaultStyle: "list300" },
        textAlign: { left: true, center: true, right: true },
    }),
    name: "TableCellRichText",
    displayName: <FormattedMessage id="tableCellRichTextBlock.displayName" defaultMessage="Rich Text" />,
};
