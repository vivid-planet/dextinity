import { alpha } from "@mui/material";
import { css, styled } from "@mui/material/styles";

import { inboxFolderColor } from "./thumbnail/DamThumbnail";

interface TableHoverHighlightProps {
    isHovered?: boolean;
}

export const FolderOuterHoverHighlight = styled("div", { shouldForwardProp: (prop) => prop !== "isHovered" })<TableHoverHighlightProps>`
    position: relative;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    overflow: hidden;

    ${({ isHovered, theme }) =>
        isHovered &&
        css`
            outline: solid 1px ${theme.palette.primary.main};

            & .MuiDataGrid-root {
                background-color: ${alpha(theme.palette.primary.main, 0.1)};
            }

            & .MuiDataGrid-root .MuiDataGrid-container--top [role="row"] {
                background-color: transparent;

                & .MuiDataGrid-columnHeader.MuiDataGrid-withBorderColor {
                    border-bottom-color: transparent;
                }
            }

            & .MuiDataGrid-footerContainer.MuiDataGrid-withBorderColor {
                border-top-color: ${theme.palette.grey[100]};
            }
        `}

    & .MuiDataGrid-row {
        transition: background-color 1s ease-in-out;

        &.DextinityDataGridRow--highlighted {
            background-color: ${({ theme }) => alpha(theme.palette.primary.dark, 0.4)};
        }
    }

    & .MuiDataGrid-row.DextinityDataGridRow--inboxFolder {
        background-color: ${({ isHovered }) => (isHovered ? alpha(inboxFolderColor, 0.1) : alpha(inboxFolderColor, 0.05))};

        &:hover {
            background-color: ${alpha(inboxFolderColor, 0.1)};
        }
    }
`;
