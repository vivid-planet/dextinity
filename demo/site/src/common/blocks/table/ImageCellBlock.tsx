import type { DamImageBlockData } from "@src/blocks.generated";
import type { CSSProperties } from "react";

import { DamImageBlock } from "../DamImageBlock";
import styles from "./ImageCellBlock.module.scss";
import type { TableColumnSize } from "./tableData";

// Without a width of its own, an image doesn't stretch its column, so the table squeezes it
const imageWidthByColumnSize: Record<TableColumnSize, number> = {
    extraSmall: 48,
    small: 96,
    standard: 160,
    large: 240,
    extraLarge: 320,
};

type Props = {
    data: DamImageBlockData;
    columnSize: TableColumnSize;
};

export const ImageCellBlock = ({ data, columnSize }: Props) => {
    const imageWidth = imageWidthByColumnSize[columnSize];

    return (
        <div className={styles.root} style={{ "--image-width": `${imageWidth}px` } as CSSProperties}>
            <DamImageBlock data={data} aspectRatio="4x3" sizes={`${imageWidth}px`} />
        </div>
    );
};
