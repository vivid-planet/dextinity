import { styled } from "@mui/material/styles";

export const ContentScopeToolbar = styled("div")`
    padding-block-end: var(--dextinity-space-3);

    &[data-in-panel] {
        padding-inline: var(--dextinity-space-4);
    }
`;
