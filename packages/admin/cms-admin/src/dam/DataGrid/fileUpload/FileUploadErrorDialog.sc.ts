import { styled } from "@mui/material/styles";

export const Files = styled("ul")`
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--dextinity-color-line);
    border-radius: var(--dextinity-radius-field);
`;

export const FileErrors = styled("li")`
    display: grid;
    gap: var(--dextinity-space-2);
    padding: var(--dextinity-space-3);

    &:not(:first-of-type) {
        border-block-start: 1px solid var(--dextinity-color-line);
    }

    @media (min-width: 720px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
        gap: var(--dextinity-space-4);
    }
`;

export const FileName = styled("div")`
    font-weight: 500;
    overflow-wrap: anywhere;
`;

export const FilePath = styled("div")`
    color: var(--dextinity-color-text-secondary);
    font-size: var(--dextinity-typography-small-size);
    overflow-wrap: anywhere;
`;

export const ErrorMessages = styled("ul")`
    display: grid;
    gap: var(--dextinity-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--dextinity-color-danger-text);
`;
