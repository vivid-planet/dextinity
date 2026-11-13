import { styled } from "@mui/material/styles";

export const TabBody = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-6);
`;

export const ActionRow = styled("div")`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--dextinity-space-3);
`;

export const Hint = styled("span")`
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
`;
