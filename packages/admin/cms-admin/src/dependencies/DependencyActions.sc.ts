import { styled } from "@mui/material/styles";

export const DependencyActionsRoot = styled("div")`
    display: flex;
    gap: var(--dextinity-space-1);
`;

export const DependencyActionsUnavailable = styled("span")`
    color: var(--dextinity-color-text-subtle);
`;

export const DependencyActionsUnavailableWrapper = styled("span")`
    display: inline-flex;
    border-radius: var(--dextinity-radius-control);
    cursor: not-allowed;

    &:focus-visible {
        outline: none;
        box-shadow: var(--dextinity-focus-ring);
    }

    @media (forced-colors: active) {
        &:focus-visible {
            outline: 2px solid;
            outline-offset: 2px;
        }
    }
`;
