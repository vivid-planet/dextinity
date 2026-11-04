import styles from "./PreviewOverlay.module.scss";
import { PreviewOverlayElement } from "./PreviewOverlayElement";
import { useIFrameBridge } from "./useIFrameBridge";

let lastSelectedElementPath = "";

export const PreviewOverlay = () => {
    const iFrameBridge = useIFrameBridge();

    let bottomMostElementPosition = 0;

    iFrameBridge.previewElementsData.forEach((element) => {
        if (element.position.zIndex > 1) {
            return;
        }

        const elementBottom = element.position.top + element.position.height;
        if (elementBottom > bottomMostElementPosition) {
            bottomMostElementPosition = elementBottom;
        }
    });

    return (
        <div className={styles.root} style={{ "--height": `${bottomMostElementPosition}px` }}>
            {iFrameBridge.previewElementsData.map((element, index) => {
                const isSelected = element.adminRoute === iFrameBridge.selectedAdminRoute;

                if (isSelected && lastSelectedElementPath !== element.adminRoute) {
                    lastSelectedElementPath = element.adminRoute;
                }

                return <PreviewOverlayElement key={index} element={element} />;
            })}
        </div>
    );
};
