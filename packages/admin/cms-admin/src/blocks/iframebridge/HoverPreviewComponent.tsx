import type { PropsWithChildren } from "react";

import * as sc from "./HoverPreviewComponent.sc";
import { useHoverPreviewComponent } from "./useHoverPreviewComponent";

interface HoverPreviewComponentProps {
    componentSlug: string;
}

export const HoverPreviewComponent = ({ children, componentSlug }: PropsWithChildren<HoverPreviewComponentProps>) => {
    const { ref, isHovered, onMouseOver, onMouseLeave } = useHoverPreviewComponent<HTMLDivElement>(componentSlug);

    return (
        <sc.Root ref={ref} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
            <sc.Hover data-hovered={isHovered ? "" : undefined} />
            <sc.Children>{children}</sc.Children>
        </sc.Root>
    );
};
