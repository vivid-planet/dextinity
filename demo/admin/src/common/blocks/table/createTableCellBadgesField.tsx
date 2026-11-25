import { createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { TextCellBlockData } from "@src/blocks.generated";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

type TableCellBadge = TextCellBlockData["badges"][number];

const badgeOptions: Array<{ value: TableCellBadge; label: ReactNode }> = [
    { value: "new", label: <FormattedMessage id="tableCellBadges.new" defaultMessage="New" /> },
    { value: "popular", label: <FormattedMessage id="tableCellBadges.popular" defaultMessage="Popular" /> },
    { value: "sale", label: <FormattedMessage id="tableCellBadges.sale" defaultMessage="Sale" /> },
];

export const createTableCellBadgesField = () =>
    createCompositeBlockSelectField<TableCellBadge[]>({
        label: <FormattedMessage id="tableCellBadges.label" defaultMessage="Badges" />,
        defaultValue: [],
        options: badgeOptions,
        componentsProps: { finalFormSelect: { multiple: true } },
    });
