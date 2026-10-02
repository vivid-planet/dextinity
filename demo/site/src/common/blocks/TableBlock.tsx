import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import clsx from "clsx";

import { RichTextBlock } from "./RichTextBlock";
import styles from "./TableBlock.module.scss";

const Table = withPreview(
    ({ data }: PropsWithData<TableBlockData>) => (
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
                                                <RichTextBlock data={cellValue?.value} disableLastBottomSpacing />
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
    { label: "Table" },
);

export const TableBlock = ({ data }: PropsWithData<TableBlockData>) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <Table data={data} />
        </div>
    </PageLayout>
);
