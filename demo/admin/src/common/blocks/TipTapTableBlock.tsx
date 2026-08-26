import { createTipTapTableBlock } from "@dextinity/cms-admin";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

export const TipTapTableBlock = createTipTapTableBlock({
    link: LinkBlock,
    textBlockStyles: [
        {
            name: "paragraph300",
            label: <FormattedMessage id="tipTapTableBlock.paragraph300" defaultMessage="Paragraph" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "paragraph200",
            label: <FormattedMessage id="tipTapTableBlock.paragraph200" defaultMessage="Paragraph Small" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 15, lineHeight: "22px" }} {...props} />,
        },
    ],
    inlineStyles: [
        {
            name: "highlight",
            label: <FormattedMessage id="tipTapTableBlock.inlineStyle.highlight" defaultMessage="Highlight" />,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
    ],
});
