import { SvgIcon, type SvgIconProps } from "@mui/material";
import type { JSX } from "react";

interface ColumnsIconProps extends SvgIconProps {
    columns: number;
}

interface RectangleAttributes {
    x: number;
    width: number;
}

type RectangleAttributesMatrix = RectangleAttributes[];

// Data to construct the rectangles in the svgs
// Index 0 is for 1 column, index 1 is for 2 columns,...
const rectangleAttributesMatrices: RectangleAttributesMatrix[] = [
    [{ x: 8, width: 32 }],
    [
        { x: 0, width: 20 },
        { x: 28, width: 20 },
    ],
    [
        { x: 0, width: 12 },
        { x: 18, width: 12 },
        { x: 36, width: 12 },
    ],
    [
        { x: 0, width: 9 },
        { x: 13, width: 9 },
        { x: 24, width: 9 },
        { x: 37, width: 9 },
    ],
    [
        { x: 0, width: 8 },
        { x: 10, width: 8 },
        { x: 20, width: 8 },
        { x: 30, width: 8 },
        { x: 40, width: 8 },
    ],
];

export function ColumnsIcon({ columns, ...svgProps }: ColumnsIconProps): JSX.Element {
    if (columns < 1) {
        throw new Error("Column number must be at least 1");
    }

    return columns > rectangleAttributesMatrices.length ? (
        // Fallback for cases where column number is too high to display it with svgs
        <span>{columns}</span>
    ) : (
        <SvgIcon viewBox="0 0 48 48" {...svgProps}>
            {rectangleAttributesMatrices[columns - 1].map((c, i) => (
                <rect key={i} y={4} height={40} {...c} />
            ))}
        </SvgIcon>
    );
}
