import { NumberField } from "@dextinity/admin";
import {
    BlocksFinalForm,
    type BlockState,
    createCompositeBlock,
    createCompositeBlockField,
    createCompositeBlockSwitchField,
    type ReadOnlyBlockRenderInterface,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import type { PriceCellBlockData } from "@src/blocks.generated";
import { FormattedMessage, FormattedNumber } from "react-intl";

import { createTableCellBadgesField } from "./createTableCellBadgesField";
import { paddedInCellPopover } from "./paddedInCellPopover";

const missingAmount = "–";

const PriceCellCompositeBlock = createCompositeBlock(
    {
        name: "PriceCell",
        displayName: <FormattedMessage id="priceCellBlock.displayName" defaultMessage="Price" />,
        groups: {
            price: {
                ...paddedInCellPopover,
                blocks: {
                    amount: {
                        block: createCompositeBlockField<PriceCellBlockData["amount"]>({
                            defaultValue: undefined,
                            AdminComponent: ({ state, updateState }) => (
                                <BlocksFinalForm<{ amount: typeof state }>
                                    onSubmit={({ amount }) => updateState(amount)}
                                    initialValues={{ amount: state }}
                                >
                                    <NumberField
                                        name="amount"
                                        label={<FormattedMessage id="priceCellBlock.amount" defaultMessage="Amount" />}
                                        decimals={2}
                                        fullWidth
                                    />
                                </BlocksFinalForm>
                            ),
                        }),
                    },
                    bold: {
                        block: createCompositeBlockSwitchField({
                            label: <FormattedMessage id="priceCellBlock.bold" defaultMessage="Bold" />,
                        }),
                    },
                    badges: { block: createTableCellBadgesField() },
                },
            },
        },
    },
    (block) => {
        block.previewContent = (state) => (state.amount != null ? [{ type: "text", content: String(state.amount) }] : []);
        return block;
    },
);

export const PriceCellBlock: typeof PriceCellCompositeBlock & ReadOnlyBlockRenderInterface<BlockState<typeof PriceCellCompositeBlock>> = {
    ...PriceCellCompositeBlock,
    ReadOnlyComponent: ({ state: { amount, bold } }) => {
        const { scope } = useContentScope();
        const { currency } = useSiteConfig({ scope });

        return (
            <Typography sx={{ fontWeight: bold ? "bold" : undefined }}>
                {amount != null ? <FormattedNumber value={amount} style="currency" currency={currency} /> : missingAmount}
            </Typography>
        );
    },
};
