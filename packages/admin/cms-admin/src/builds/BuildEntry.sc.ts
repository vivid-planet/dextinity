import { styled } from "@mui/material/styles";

export const BuildStatusContent = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-3);
    inline-size: 280px;
    max-inline-size: 100%;
`;

export const BuildStatusRow = styled("div")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--dextinity-space-2);
`;

export const BuildStatusText = styled("span")`
    color: var(--dextinity-color-text-subtle);
`;

export const BuildStatusError = styled("span")`
    color: var(--dextinity-color-danger-text);
`;
