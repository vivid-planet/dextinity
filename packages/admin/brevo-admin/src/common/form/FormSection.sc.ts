import { styled } from "@mui/material/styles";

export const Section = styled("section")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-density-form-gap);
    min-inline-size: 0;
`;

export const Head = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-1);
`;

export const Title = styled("h3")`
    margin: 0;
    font-size: var(--dextinity-typography-section-size);
    font-weight: var(--dextinity-typography-section-font-weight);
`;

export const Description = styled("p")`
    margin: 0;
    color: var(--dextinity-color-text-secondary);
    font-size: var(--dextinity-typography-small-size);
`;

export const Fields = styled("div")`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: var(--dextinity-density-form-gap);
`;
