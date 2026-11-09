import { styled } from "@mui/material/styles";

export const DetailContent = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-4);
`;

export const DetailHeading = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-2);
    min-width: 0;
`;

export const DetailTitle = styled("h3")`
    margin: 0;
    font-family: var(--dextinity-font-family-display);
    font-size: 30px;
    font-weight: var(--dextinity-typography-display-font-weight);
    line-height: 1.1;
    letter-spacing: var(--dextinity-typography-display-letter-spacing);
    text-transform: var(--dextinity-typography-display-text-transform);
    overflow-wrap: anywhere;
`;

export const DetailActions = styled("div")`
    display: flex;
    flex-wrap: wrap;
    gap: var(--dextinity-space-2);
`;
