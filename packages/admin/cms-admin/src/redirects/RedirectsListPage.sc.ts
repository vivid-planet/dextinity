import { styled } from "@mui/material/styles";

export const Source = styled("span")`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-inline-size: 0;
    font-family: var(--dextinity-font-family-mono);
    font-size: var(--dextinity-typography-mono-size);
    overflow-wrap: anywhere;
`;

export const Comment = styled("span")`
    display: -webkit-box;
    overflow: hidden;
    color: var(--dextinity-color-text-secondary);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
`;

export const Muted = styled("span")`
    color: var(--dextinity-color-text-tertiary);
`;

export const ActiveCell = styled("span")`
    display: inline-flex;
`;
