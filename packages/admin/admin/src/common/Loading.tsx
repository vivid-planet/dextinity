import { BallTriangle } from "@dextinity/admin-icons";
import type { SvgIconProps } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { type CSSProperties, useRef } from "react";

export interface LoadingProps extends SvgIconProps {
    behavior?: "auto" | "fillParent" | "fillParentAbsolute" | "fillPageHeight";
}

export const Loading = ({ behavior = "auto", fontSize, sx, ...svgIconsProps }: LoadingProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const offsetTop = rootRef.current?.offsetTop || 0;

    return (
        <Root ref={rootRef} style={{ "--dextinity-admin-loading-offset-top": `${offsetTop}px` } as CSSProperties} behavior={behavior}>
            <LoadingContainer behavior={behavior}>
                <BallTriangle sx={{ fontSize: fontSize ?? 40, ...sx }} {...svgIconsProps} />
            </LoadingContainer>
        </Root>
    );
};

const Root = styled("div")<Required<Pick<LoadingProps, "behavior">>>`
    position: relative;

    ${({ behavior }) => {
        if (behavior === "fillParent") {
            return css`
                height: 100%;
                flex-grow: 1;
            `;
        }

        if (behavior === "fillParentAbsolute") {
            return css`
                position: absolute;
                inset: 0;
            `;
        }

        if (behavior === "fillPageHeight") {
            return css`
                height: calc(100vh - var(--dextinity-admin-loading-offset-top));
            `;
        }
    }}
`;

const LoadingContainer = styled("div")<Required<Pick<LoadingProps, "behavior">>>`
    text-align: center;

    ${({ behavior }) =>
        behavior !== "auto" &&
        css`
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        `}
`;
