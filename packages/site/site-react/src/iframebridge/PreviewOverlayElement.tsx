import clsx from "clsx";

import type { OverlayElementData } from "./IFrameBridge";
import styles from "./PreviewOverlayElement.module.scss";
import { useIFrameBridge } from "./useIFrameBridge";

type Props = {
    element: OverlayElementData;
};

export const PreviewOverlayElement = ({ element }: Props) => {
    const iFrameBridge = useIFrameBridge();

    const isSelected = element.adminRoute === iFrameBridge.selectedAdminRoute;
    const isHovered = element.adminRoute === iFrameBridge.hoveredAdminRoute;

    return (
        <div
            key={element.adminRoute}
            className={clsx(
                styles.root,
                iFrameBridge.showOutlines && !isHovered && styles.showBlockOutlines,
                isSelected && styles.blockIsSelected,
                isHovered && styles.isHoveredInBlockList,
            )}
            title={element.label}
            onClick={() => {
                iFrameBridge.sendSelectComponent(element.adminRoute);
            }}
            onMouseEnter={() => {
                iFrameBridge.sendHoverComponent(element.adminRoute);
            }}
            onMouseLeave={() => {
                iFrameBridge.sendHoverComponent(null);
            }}
            style={element.position}
        >
            <div className={styles.label}>{element.label}</div>
        </div>
    );
};
