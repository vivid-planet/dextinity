import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { ResponsiveTableBlockData } from "@src/blocks.generated";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { TipTapTableBlock } from "./TipTapTableBlock";

const responsiveBehaviorOptions: Array<{ value: ResponsiveTableBlockData["responsiveBehavior"]; label: ReactNode }> = [
    {
        value: "horizontalScrolling",
        label: <FormattedMessage id="responsiveTableBlock.responsiveBehavior.horizontalScrolling" defaultMessage="Horizontal Scrolling" />,
    },
    {
        value: "headerRow",
        label: <FormattedMessage id="responsiveTableBlock.responsiveBehavior.headerRow" defaultMessage="First Row as Header" />,
    },
    {
        value: "headerColumn",
        label: <FormattedMessage id="responsiveTableBlock.responsiveBehavior.headerColumn" defaultMessage="First Column as Header" />,
    },
];

export const ResponsiveTableBlock = createCompositeBlock(
    {
        name: "ResponsiveTable",
        displayName: <FormattedMessage id="responsiveTableBlock.displayName" defaultMessage="Table (Responsive)" />,
        blocks: {
            responsiveBehavior: {
                block: createCompositeBlockSelectField<ResponsiveTableBlockData["responsiveBehavior"]>({
                    label: <FormattedMessage id="responsiveTableBlock.responsiveBehavior" defaultMessage="Responsive Behavior" />,
                    defaultValue: "horizontalScrolling",
                    options: responsiveBehaviorOptions,
                    required: true,
                }),
                hiddenInSubroute: true,
            },
            table: {
                block: TipTapTableBlock,
                nested: true,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        return block;
    },
);
