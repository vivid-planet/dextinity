import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { StandaloneCallToActionListBlockData } from "@src/blocks.generated";
import { CallToActionListBlock } from "@src/common/blocks/CallToActionListBlock";
import { FormattedMessage } from "react-intl";

export const StandaloneCallToActionListBlock = createCompositeBlock(
    {
        name: "StandaloneCallToActionList",
        displayName: CallToActionListBlock.displayName,
        blocks: {
            callToActionList: {
                block: CallToActionListBlock,
            },
            alignment: {
                block: createCompositeBlockSelectField<StandaloneCallToActionListBlockData["alignment"]>({
                    label: <FormattedMessage id="standaloneCallToActionList.alignment" defaultMessage="Alignment" />,
                    defaultValue: "left",
                    options: [
                        { value: "left", label: <FormattedMessage id="standaloneCallToActionList.alignment.left" defaultMessage="left" /> },
                        { value: "center", label: <FormattedMessage id="standaloneCallToActionList.alignment.center" defaultMessage="center" /> },
                        { value: "right", label: <FormattedMessage id="standaloneCallToActionList.alignment.right" defaultMessage="right" /> },
                    ],
                }),
                hiddenInSubroute: true,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Navigation;
        return block;
    },
);
