import { styled } from "@mui/material/styles";

export const DetailContent = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-4);
`;

export const DetailForm = styled("form")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-3);
`;

export const DetailActions = styled("div")`
    display: flex;
    flex-wrap: wrap;
    gap: var(--dextinity-space-2);
`;

export const DetailFormFooter = styled("div")`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--dextinity-space-2);
`;
