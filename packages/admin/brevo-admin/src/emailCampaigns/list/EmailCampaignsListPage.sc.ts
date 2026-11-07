import { styled } from "@mui/material/styles";

export const TitleCell = styled("span")`
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
`;

export const Title = styled("span")`
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const SecondaryText = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const Muted = styled("span")`
    color: var(--dextinity-color-text-tertiary);
`;
