import { styled } from "@mui/material/styles";

export const Root = styled("span")`
    display: flex;
    align-items: center;
    gap: 8px;
    min-inline-size: 0;
`;

export const Icon = styled("span")`
    display: inline-flex;
    flex-shrink: 0;
    color: var(--dextinity-color-text-tertiary);
`;

export const Text = styled("span")`
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

export const Subtitle = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-tertiary);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
