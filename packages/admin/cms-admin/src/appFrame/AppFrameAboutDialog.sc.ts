import { styled } from "@mui/material/styles";

export const AppFrameAboutDialogContent = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--dextinity-space-4);

    & > dl {
        align-self: stretch;
    }
`;

export const AppFrameAboutDialogLogo = styled("div")`
    display: flex;
    align-self: center;
    padding-block: var(--dextinity-space-2);
`;
