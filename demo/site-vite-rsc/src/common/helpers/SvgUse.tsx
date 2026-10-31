"use client";
import type { SVGProps } from "react";

interface SvgUseProps extends SVGProps<SVGSVGElement> {
    href: string;
}

export const SvgUse = ({ href, ...props }: SvgUseProps) => (
    <svg aria-hidden="true" {...props}>
        <use href={href} />
    </svg>
);
