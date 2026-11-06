import { styled } from "@mui/material/styles";

export const Filenames = styled("ul")`
    max-block-size: 240px;
    overflow-y: auto;
    margin: 0 0 var(--dextinity-space-4);
    padding: 0;
    list-style: none;
    border: 1px solid var(--dextinity-color-line);
    border-radius: var(--dextinity-radius-field);
`;

export const Filename = styled("li")`
    padding: var(--dextinity-space-2) var(--dextinity-space-3);
    overflow-wrap: anywhere;

    &:not(:first-of-type) {
        border-block-start: 1px solid var(--dextinity-color-line);
    }
`;

export const ActionDescriptions = styled("ul")`
    display: grid;
    gap: var(--dextinity-space-1);
    margin: 0;
    padding-inline-start: var(--dextinity-space-4);
`;
