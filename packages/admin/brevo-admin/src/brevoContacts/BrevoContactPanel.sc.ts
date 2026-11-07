import { styled } from "@mui/material/styles";

export const FormBody = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-density-form-gap);
`;

export const Footer = styled("div")`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--dextinity-space-2);
    padding-block-start: 14px;
    box-shadow: inset 0 var(--dextinity-line-width) 0 var(--dextinity-color-line);
`;

export const FooterActions = styled("span")`
    display: flex;
    gap: var(--dextinity-space-2);
`;
