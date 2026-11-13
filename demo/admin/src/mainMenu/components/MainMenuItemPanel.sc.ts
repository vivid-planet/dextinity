import { BlockPreviewPane } from "@dextinity/cms-admin";
import { styled } from "@mui/material/styles";

export const MainMenuItemContent = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--dextinity-density-form-gap);

    & > :not(button) {
        align-self: stretch;
    }
`;

export const MainMenuItemFooter = styled("div")`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--dextinity-space-2);
    padding-block-start: 14px;
    box-shadow: inset 0 var(--dextinity-line-width) 0 var(--dextinity-color-line);
`;

export const MainMenuItemPreviewSection = styled("section")`
    display: flex;
    flex-direction: column;
    block-size: 360px;
`;

export const MainMenuItemPreview = styled(BlockPreviewPane)`
    flex: 1;
    min-block-size: 0;
`;
