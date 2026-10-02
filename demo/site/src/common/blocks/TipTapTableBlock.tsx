import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TipTapTableBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import clsx from "clsx";

import styles from "./TableBlock.module.scss";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

const Table = withPreview(
    ({ data }: PropsWithData<TipTapTableBlockData>) => (
        <AnimateBoxInOnScroll direction="bottom" offset={300}>
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
        </AnimateBoxInOnScroll>
    ),
    { label: "TipTap Table" },
);

export const TipTapTableBlock = ({ data }: PropsWithData<TipTapTableBlockData>) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <Table data={data} />
        </div>
    </PageLayout>
);
