import { styled } from "@mui/material/styles";

export const Root = styled("div")`
    position: relative;
`;

export const Children = styled("div")`
    position: relative;
    z-index: 1;
`;

export const Hover = styled("div")`
    position: absolute;
    inset: 0 0 1px;
    z-index: 2;
    pointer-events: none;
    border-radius: var(--dextinity-radius-field);

    &[data-hovered] {
        background: color-mix(in oklch, var(--dextinity-color-accent) 12%, transparent);
        box-shadow: inset 0 0 0 1px var(--dextinity-color-accent);
    }
`;
