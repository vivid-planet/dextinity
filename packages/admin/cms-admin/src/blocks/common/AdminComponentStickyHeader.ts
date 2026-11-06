import { styled } from "@mui/material/styles";

import { stickyTopVariable } from "./stickyTopVariable";

export const AdminComponentStickyHeader = styled("div")`
    position: sticky;
    inset-block-start: var(${stickyTopVariable}, 0px);
    z-index: 15;
    border-block-end: var(--dextinity-line-width) solid var(--dextinity-color-line);
    border-start-start-radius: var(--dextinity-block-radius);
    border-start-end-radius: var(--dextinity-block-radius);
    background: var(--dextinity-block-background);
`;
