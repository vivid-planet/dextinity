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

export const ScrollableColumn = styled(Column)`
    overflow-y: auto;
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
            background-color: var(--dextinity-color-line-strong);
        }
    }
`;

export const FirstColumnContainer = styled("div")`
    height: 100%;
    overflow-x: auto;
`;

export const PreviewContainer = styled("div")`
    position: absolute;
    z-index: 15;
    top: 0;
    left: 0;
    right: 0;
    bottom: 32px;
    transform-origin: left bottom;
    will-change: transform;
    transition: transform var(--dextinity-motion-duration-long) var(--dextinity-motion-easing);

    &[data-minimized] {
        transform: translateZ(0) translateY(-32px) scale(0.1);
        border-radius: 50px;
        overflow: hidden;
    }
`;

export const MaximizeButton = styled("button")`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: oklch(0 0 0 / 0.6);
    color: oklch(1 0 0);
    cursor: pointer;
    --dextinity-icon-size: 240px;
`;
