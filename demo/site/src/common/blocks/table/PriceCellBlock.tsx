"use client";

import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import { FormattedNumber } from "@dextinity/site-nextjs/intl";
import type { PriceCellBlockData } from "@src/blocks.generated";
import { useSiteConfig } from "@src/util/SiteConfigProvider";

import { TableCellWithBadges } from "./TableCellWithBadges";

const missingAmount = "–";

export const PriceCellBlock = withPreview(
    ({ data: { amount, bold, badges } }: PropsWithData<PriceCellBlockData>) => {
        const { currency } = useSiteConfig();

        const formattedAmount = amount != null ? <FormattedNumber value={amount} style="currency" currency={currency} /> : missingAmount;

        return <TableCellWithBadges badges={badges}>{bold ? <strong>{formattedAmount}</strong> : formattedAmount}</TableCellWithBadges>;
    },
    { label: "Price" },
);
