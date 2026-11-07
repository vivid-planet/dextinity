import { styled } from "@mui/material/styles";

export const DataGridTitleCell = styled("span")`
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
`;

export const DataGridTitle = styled("span")`
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DataGridSecondaryText = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DataGridMonoText = styled("span")`
    overflow: hidden;
    font-family: var(--dextinity-font-family-mono);
    font-size: var(--dextinity-typography-mono-size);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DataGridRowActions = styled("div")`
    display: flex;
    gap: var(--dextinity-space-1);
`;
