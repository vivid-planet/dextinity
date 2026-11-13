import { styled } from "@mui/material/styles";

export const GridRoot = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-4);
`;

export const NameCell = styled("span")`
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
`;

export const Name = styled("span")`
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const SecondaryText = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
`;
