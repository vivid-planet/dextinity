import { FormattedMessage } from "@dextinity/site-nextjs/intl";
import type { TextCellBlockData } from "@src/blocks.generated";
import type { PropsWithChildren, ReactNode } from "react";

import styles from "./TableCellWithBadges.module.scss";

type TableCellBadge = TextCellBlockData["badges"][number];

const badgeLabels: Record<TableCellBadge, ReactNode> = {
    new: <FormattedMessage id="tableCellBadges.new" defaultMessage="New" />,
    popular: <FormattedMessage id="tableCellBadges.popular" defaultMessage="Popular" />,
    sale: <FormattedMessage id="tableCellBadges.sale" defaultMessage="Sale" />,
};

export const TableCellWithBadges = ({ badges, children }: PropsWithChildren<{ badges: TableCellBadge[] }>) => (
    <div className={styles.root}>
        <div className={styles.fullWidthContent}>{children}</div>
        {badges.length > 0 && (
            <ul className={styles.badges}>
                {badges.map((badge) => (
                    <li key={badge} className={styles.badge}>
                        {badgeLabels[badge]}
                    </li>
                ))}
            </ul>
        )}
    </div>
);
