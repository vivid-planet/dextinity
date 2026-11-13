import { styled } from "@mui/material/styles";

export const Sections = styled("div")`
    container-type: inline-size;
    display: grid;
    gap: var(--dextinity-space-8);
`;

export const Section = styled("section")`
    display: grid;
    gap: var(--dextinity-space-4);

    & + & {
        padding-block-start: var(--dextinity-space-8);
        border-block-start: var(--dextinity-line-width) solid var(--dextinity-color-line);
    }
`;

export const SectionHead = styled("div")`
    display: grid;
    gap: var(--dextinity-space-1);

    p {
        margin: 0;
        color: var(--dextinity-color-text-subtle);
    }
`;

export const Fields = styled("div")`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--dextinity-density-form-gap);

    @container (max-width: 480px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const FullWidth = styled("div")`
    grid-column: 1 / -1;
    min-inline-size: 0;
`;
