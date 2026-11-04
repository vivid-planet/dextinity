import { css } from "@mui/material";
import { styled } from "@mui/material/styles";

import type { GQLFocalPoint } from "../../graphql.generated";

export const ImageContainer = styled("div")`
    .ReactCrop__crop-selection {
        border: 2px solid ${({ theme }) => theme.palette.primary.main};
    }

    .ReactCrop__drag-handle {
        &::after {
            width: 6px;
            height: 6px;
            background-color: ${({ theme }) => theme.palette.primary.main};
            border: none;
        }

        &.ord-nw {
            margin-top: -3px;
            margin-left: -3px;
        }

        &.ord-sw {
            margin-bottom: -3px;
            margin-left: -3px;
        }

        &.ord-ne {
            margin-top: -3px;
            margin-right: -3px;
        }

        &.ord-se {
            margin-bottom: -3px;
            margin-right: -3px;
        }

        &.ord-n,
        &.ord-s,
        &.ord-e,
        &.ord-w {
            display: none;
        }
    }

    .ReactCrop__rule-of-thirds-vt::before,
    .ReactCrop__rule-of-thirds-vt::after,
    .ReactCrop__rule-of-thirds-hz::before,
    .ReactCrop__rule-of-thirds-hz::after {
        background-color: ${({ theme }) => theme.palette.primary.main};
    }
`;

interface FocalPointHandleProps {
    point: GQLFocalPoint;
    selected: boolean;
}

export const FocalPointHandle = styled("button")<FocalPointHandleProps>`
    position: absolute;
    z-index: 1;
    width: 24px;
    height: 24px;
    margin-top: -12px;
    margin-left: -12px;
    padding: 0;
    background: none;
    outline: none;
    border: none;
    cursor: pointer;

    &:hover {
        &::after {
            width: 16px;
            height: 16px;
            margin: 3px;
            border: 2px solid ${({ theme }) => theme.palette.common.white};
        }
    }

    &::after {
        content: " ";
        display: block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.palette.primary.main};
        margin: 9px;
        transition-property: width, height, border, margin;
        transition-duration: 0.5s;
        transition-timing-function: ease;

        ${({ selected, theme }) =>
            selected &&
            css`
                width: 16px;
                height: 16px;
                margin: 3px;
                background-color: ${theme.palette.success.main};
                border: 2px solid ${theme.palette.common.white};
            `}
    }

    ${({ point }) => {
        switch (point) {
            case "CENTER":
                return css`
                    top: 50%;
                    left: 50%;
                `;

            case "NORTHEAST":
                return css`
                    top: calc(100% / 3);
                    left: calc(100% * 2 / 3);
                `;

            case "NORTHWEST":
                return css`
                    top: calc(100% / 3);
                    left: calc(100% / 3);
                `;

            case "SOUTHEAST":
                return css`
                    top: calc(100% * 2 / 3);
                    left: calc(100% * 2 / 3);
                `;

            case "SOUTHWEST":
                return css`
                    top: calc(100% * 2 / 3);
                    left: calc(100% / 3);
                `;
        }
    }}
`;
