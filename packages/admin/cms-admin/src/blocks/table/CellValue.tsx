import { styled } from "@mui/material/styles";

import { useTableBlockContext } from "./TableBlockContext";

type Props = {
    highlighted: boolean;
    isTemporarilyHighlighted?: boolean;
    value: unknown;
    /** Finds the cell to scroll to, e.g. the cell clicked in the preview. */
    cellKey?: string;
};

export const tableCellKeyAttribute = "data-table-cell-key";

export const CellValue = ({ highlighted, isTemporarilyHighlighted, value, cellKey }: Props) => {
    const { RichTextBlock } = useTableBlockContext();

    return (
        <CellValueContainer
            {...{ [tableCellKeyAttribute]: cellKey }}
            data-highlighted={highlighted ? "" : undefined}
            data-temporarily-highlighted={isTemporarilyHighlighted ? "" : undefined}
        >
            <RteContent>
                <RichTextBlock.ReadOnlyComponent state={value} />
            </RteContent>
        </CellValueContainer>
    );
};

// Fills the cell's padding, so a highlighted row or column reads as a stripe
const CellValueContainer = styled("div")`
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-block-size: var(--dextinity-data-grid-row-height);
    margin-inline: calc(-1 * var(--dextinity-data-grid-cell-padding));
    padding: var(--dextinity-space-2) var(--dextinity-data-grid-cell-padding);

    &[data-highlighted] {
        background: color-mix(in oklch, var(--dextinity-color-text) 6%, transparent);
    }

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--dextinity-color-accent-soft);
        opacity: 0;
        transition: opacity 1s ease-in-out;
        pointer-events: none;
    }

    &[data-temporarily-highlighted]::after {
        opacity: 1;
    }
`;

const RteContent = styled("div")`
    color: var(--dextinity-data-grid-foreground);
    max-block-size: 7.5em;
    overflow: hidden;
    pointer-events: none;

    // The rich text renders with the MUI theme, which doesn't follow the color scheme of the design system
    .MuiTypography-root {
        color: inherit;
    }

    .DextinityAdminRteBlockElement-root:first-of-type,
    .MuiTypography-root:first-of-type,
    p:first-of-type {
        margin-block-start: 0;
    }

    .DextinityAdminRteBlockElement-root:last-of-type,
    .MuiTypography-root:last-of-type,
    p:last-of-type {
        margin-block-end: 0;
    }
`;
