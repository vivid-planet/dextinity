import { styled } from "@mui/material/styles";

export const FormBody = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-density-form-gap);
`;

export const Section = styled("section")`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-inline-size: 0;
`;

export const SectionTitle = styled("h3")`
    margin: 0;
    font-size: var(--dextinity-typography-section-size);
    font-weight: var(--dextinity-typography-section-font-weight);
`;

export const Footer = styled("div")`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-block-start: 14px;
    box-shadow: inset 0 var(--dextinity-line-width) 0 var(--dextinity-color-line);
`;

export const FooterActions = styled("span")`
    display: flex;
    gap: 8px;
`;
