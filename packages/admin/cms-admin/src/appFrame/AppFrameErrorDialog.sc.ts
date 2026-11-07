import { styled } from "@mui/material/styles";

export const AppFrameErrorDialogContent = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--dextinity-space-3);
    overflow-wrap: anywhere;

    & > dl {
        align-self: stretch;
    }
`;

export const AppFrameErrorList = styled("ul")`
    margin: 0;
    padding-inline-start: var(--dextinity-space-6);
`;
