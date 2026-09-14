import { Maximize } from "@dextinity/admin-icons";
import { css } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReactSplit from "react-split";

export const Root = styled("div")`
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

interface ColumnProps {
    height: number;
}

export const Column = styled("div")<ColumnProps>`
    position: relative;
    height: ${({ height }) => height}px;
`;

export const Split = styled(ReactSplit)`
    min-height: 0;
    flex: 1;
    display: flex;

    > .gutter {
        position: relative;
        cursor: col-resize;

        :after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 80px;
            border-radius: 2px;
            margin-top: -40px;
            margin-left: -2px;
            background-color: ${({ theme }) => theme.palette.grey[200]};
        }
    }
`;

export const FirstColumnContainer = styled("div")`
    height: 100%;
    overflow-x: auto;
`;

interface PreviewContainerProps {
    minimized: boolean;
}

export const PreviewContainer = styled("div", { shouldForwardProp: (prop) => prop !== "minimized" })<PreviewContainerProps>`
    position: absolute;
    z-index: 15;
    top: 0;
    left: 0;
    right: 0;
    bottom: 32px;
    transform-origin: left bottom;
    will-change: transform;
    transition: transform 0.25s ease;

    ${({ minimized, theme }) =>
        minimized &&
        css`
            transform: translateZ(0) translateY(-${theme.spacing(4)}) scale(0.1);
            border-radius: 50px;
            overflow: hidden;
        `}
`;

export const MaximizeButton = styled("button")`
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
`;

export const MaximizeIcon = styled(Maximize)`
    fill: ${({ theme }) => theme.palette.common.white};
    transform: scale(15);
`;
