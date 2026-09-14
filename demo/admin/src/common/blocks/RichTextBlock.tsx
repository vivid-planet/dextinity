import { createRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

export const RichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        standardBlockType: "paragraph-standard",
        blocktypeMap: {
            "paragraph-standard": {
                label: <FormattedMessage id="richTextBlock.paragraphStandard" defaultMessage="Paragraph Standard" />,
            },
            "paragraph-small": {
                label: <FormattedMessage id="richTextBlock.paragraphSmall" defaultMessage="Paragraph Small" />,
                renderConfig: {
                    element: (props) => <Typography paragraph variant="body2" {...props} />,
                },
            },
        },
    },
});
