import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

interface Props {
    top?: ReactNode;
    bottom?: ReactNode;
    addOffsetForUnevenBorders?: boolean; // When the parent element has a border on the bottom but none on the top, we need to add an offset to the top element
}

export const InsertInBetweenAction = ({ top, bottom, addOffsetForUnevenBorders }: Props) => {
    return (
        <Root>
            <TopSpot $offsetForBorder={Boolean(addOffsetForUnevenBorders)}>{top}</TopSpot>
            <BottomSpot>{bottom}</BottomSpot>
        </Root>
    );
};

const Root = styled("div")`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
`;

const TopSpot = styled("div")<{ $offsetForBorder: boolean }>`
    position: absolute;
    top: ${({ $offsetForBorder }) => ($offsetForBorder ? "-14px" : "-13px")};
    pointer-events: all;
`;

const BottomSpot = styled("div")`
    position: absolute;
    bottom: -13px;
    pointer-events: all;
`;
