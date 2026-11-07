import { styled } from "@mui/material/styles";

export const EditorContent = styled("div")`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--dextinity-space-6);
`;

export const FormContent = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-6);
`;

export const HeaderActions = styled("div")`
    display: flex;
    align-items: center;
    gap: var(--dextinity-space-2);
`;
