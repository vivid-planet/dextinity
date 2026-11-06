import { styled } from "@mui/material/styles";

export const AdminComponentStickyFooter = styled("div")`
    && {
        position: sticky;
        inset-block-end: 0;
        z-index: 15;
        margin-block-start: calc(-1 * var(--dextinity-line-width));
        border-block-start: var(--dextinity-line-width) solid var(--dextinity-color-line);
        border-end-start-radius: var(--dextinity-block-radius);
        border-end-end-radius: var(--dextinity-block-radius);
        background: var(--dextinity-block-background);
    }
`;
