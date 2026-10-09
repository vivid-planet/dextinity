import { BlockCategory, type BlockInterface, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { TableBlockData } from "@src/blocks.generated";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

type ResponsiveBehavior = TableBlockData["responsiveBehavior"];

const responsiveBehaviorOptions: Array<{ value: ResponsiveBehavior; label: ReactNode }> = [
    {
        value: "scrollSideways",
        label: <FormattedMessage id="tableBlock.responsiveBehavior.scrollSideways" defaultMessage="Scroll Sideways" />,
    },
    {
        value: "none",
        label: <FormattedMessage id="tableBlock.responsiveBehavior.none" defaultMessage="None" />,
    },
];

export function createTableBlockWithResponsiveBehavior({
    name,
    displayName,
    tableContentBlock,
}: {
    name: string;
    displayName: ReactNode;
    tableContentBlock: BlockInterface;
}) {
    return createCompositeBlock(
        {
            name,
            displayName,
            blocks: {
                table: {
                    block: tableContentBlock,
                    nested: true,
                },
                responsiveBehavior: {
                    block: createCompositeBlockSelectField<ResponsiveBehavior>({
                        label: <FormattedMessage id="tableBlock.responsiveBehavior" defaultMessage="Responsive Behavior" />,
                        defaultValue: "scrollSideways",
                        options: responsiveBehaviorOptions,
                        required: true,
                    }),
                    hiddenInSubroute: true,
                },
            },
        },
        (block) => {
            block.category = BlockCategory.TextAndContent;
            return block;
        },
    );
}
