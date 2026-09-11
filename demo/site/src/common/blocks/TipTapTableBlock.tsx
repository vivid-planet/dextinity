import type { PropsWithData } from "@dextinity/site-nextjs";
import type { TipTapTableBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";

import styles from "./TableBlock.module.scss";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

export const TipTapTableBlock = ({ data }: PropsWithData<TipTapTableBlockData>) => {
    return (
        <PageLayout grid>
            <div className={styles.pageLayoutContent}>
                <table className={styles.table}>
                    <tbody>
                        {data.rows.map((row) => (
                            <tr key={row.id} className={styles.row}>
                                {data.columns.map((column) => {
                                    const cellValue = row.cellValues.find((cellValue) => cellValue.columnId === column.id);
                                    const highlightCell = row.highlighted || column.highlighted;

                                    return (
                                        <td key={column.id} className={clsx([styles.cell, highlightCell && styles["cell--highlighted"]])}>
                                            {cellValue?.value && (
                                                <div className={styles["cell__content"]}>
                                                    <TipTapRichTextBlock data={cellValue.value} disableLastBottomSpacing />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageLayout>
    );
};
