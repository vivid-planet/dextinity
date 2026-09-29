import { SvgIcon, type SvgIconProps } from "@mui/material";
import { forwardRef } from "react";

import { useUniqueId } from "./useUniqueId";

export type DextinityIconVariant = "light" | "dark" | "masked";

export interface DextinityIconProps extends SvgIconProps {
    /**
     * `light` and `dark` are the rounded badge on a gradient background. `masked` is the variant for contexts
     * that apply their own mask (favicons, app icons): it has an opaque square background and a smaller mark,
     * leaving a safe zone at the edges.
     */
    variant?: DextinityIconVariant;
}

const badgePath =
    "M160.243 0H339.757C395.477 0 415.682 5.8016 436.053 16.6958C456.423 27.59 472.41 43.5768 483.304 63.9471C494.198 84.3175 500 104.523 500 160.243V339.757C500 395.477 494.198 415.682 483.304 436.053C472.41 456.423 456.423 472.41 436.053 483.304C415.682 494.198 395.477 500 339.757 500H160.243C104.523 500 84.3175 494.198 63.9471 483.304C43.5768 472.41 27.59 456.423 16.6958 436.053C5.8016 415.682 0 395.477 0 339.757V160.243C0 104.523 5.8016 84.3175 16.6958 63.9471C27.59 43.5768 43.5768 27.59 63.9471 16.6958C84.3175 5.8016 104.523 0 160.243 0Z";

const markPath =
    "M309.766 250C309.766 216.992 283.008 190.234 250 190.234H223.438V309.766H250C283.008 309.766 309.766 283.008 309.766 250ZM342.969 250C342.969 301.345 301.345 342.969 250 342.969H190.234V190.234H150.391V382.812H250C323.35 382.812 382.812 323.35 382.812 250C382.812 176.65 323.35 117.188 250 117.188H223.438V157.031H250C301.345 157.031 342.969 198.655 342.969 250ZM416.016 250C416.016 341.688 341.688 416.016 250 416.016H117.188V157.031H190.234V83.9844H250C341.688 83.9844 416.016 158.312 416.016 250Z";

const maskedMarkPath =
    "M299.219 250C299.219 222.817 277.183 200.781 250 200.781H228.125V299.219H250C277.183 299.219 299.219 277.183 299.219 250ZM326.563 250C326.563 292.284 292.284 326.563 250 326.563H200.781V200.781H167.969V359.375H250C310.406 359.375 359.375 310.406 359.375 250C359.375 189.594 310.406 140.625 250 140.625H228.125V173.438H250C292.284 173.438 326.563 207.716 326.563 250ZM386.719 250C386.719 325.508 325.508 386.719 250 386.719H140.625V173.438H200.781V113.281H250C325.508 113.281 386.719 174.492 386.719 250Z";

interface ShadowRectsProps {
    gradientId: string;
    opacity: number;
    size: number;
    x: number;
    y: number;
    /** The upper rect is mirrored vertically, so it fades towards the top instead of the bottom. */
    flippedY: number;
}

/** The two squares that make the mark's inner stroke appear to pass behind the outer arc. */
const ShadowRects = ({ gradientId, opacity, size, x, y, flippedY }: ShadowRectsProps) => (
    <>
        <rect opacity={opacity} x={x} y={y} width={size} height={size} fill={`url(#${gradientId})`} />
        <rect opacity={opacity} width={size} height={size} transform={`matrix(1 0 0 -1 ${x} ${flippedY})`} fill={`url(#${gradientId})`} />
    </>
);

/**
 * A single black-to-transparent gradient serves both shadow rects: it uses the default `objectBoundingBox`
 * units, so the mirrored rect gets the mirrored gradient for free.
 */
const ShadowGradient = ({ id }: { id: string }) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop />
        <stop offset="1" stopOpacity="0" />
    </linearGradient>
);

const BrandGradientStops = () => (
    <>
        <stop offset="0.3" stopColor="#403AF2" />
        <stop offset="1" stopColor="#0FD1C7" />
    </>
);

export const DextinityIcon = forwardRef<SVGSVGElement, DextinityIconProps>(({ variant = "light", ...props }, ref) => {
    // Ids in `defs` are document-global, so each instance needs its own. With the static ids Figma exports,
    // a second icon on the page would take over the first one's gradients.
    const backgroundGradientId = useUniqueId("dextinity-icon-background");
    const markGradientId = useUniqueId("dextinity-icon-mark");
    const shadowGradientId = useUniqueId("dextinity-icon-shadow");

    if (variant === "masked") {
        return (
            <SvgIcon viewBox="0 0 500 500" {...props} ref={ref}>
                <defs>
                    <linearGradient id={markGradientId} x1="140.625" y1="386.719" x2="363.477" y2="163.867" gradientUnits="userSpaceOnUse">
                        <BrandGradientStops />
                    </linearGradient>
                    <ShadowGradient id={shadowGradientId} />
                </defs>
                <rect width="500" height="500" fill="white" />
                <path d={maskedMarkPath} fill={`url(#${markGradientId})`} />
                <ShadowRects gradientId={shadowGradientId} opacity={0.4} size={27.3438} x={200.781} y={200.781} flippedY={173.438} />
            </SvgIcon>
        );
    }

    const isDark = variant === "dark";

    return (
        <SvgIcon viewBox="0 0 500 500" {...props} ref={ref}>
            <defs>
                {isDark ? (
                    <>
                        <linearGradient id={backgroundGradientId} x1="27.3438" y1="469.238" x2="477.539" y2="31.25" gradientUnits="userSpaceOnUse">
                            <stop offset="0.5" stopColor="#141517" />
                            <stop offset="1" stopColor="#3B3E45" />
                        </linearGradient>
                        <linearGradient id={markGradientId} x1="117.188" y1="416.016" x2="387.793" y2="145.41" gradientUnits="userSpaceOnUse">
                            <BrandGradientStops />
                        </linearGradient>
                    </>
                ) : (
                    <linearGradient id={backgroundGradientId} x1="0" y1="500" x2="405.249" y2="49.7237" gradientUnits="userSpaceOnUse">
                        <BrandGradientStops />
                    </linearGradient>
                )}
                <ShadowGradient id={shadowGradientId} />
            </defs>
            <path d={badgePath} fill={`url(#${backgroundGradientId})`} />
            <path d={markPath} fill={isDark ? `url(#${markGradientId})` : "white"} />
            <ShadowRects gradientId={shadowGradientId} opacity={isDark ? 0.4 : 0.3} size={33.2031} x={190.234} y={190.234} flippedY={157.031} />
        </SvgIcon>
    );
});
