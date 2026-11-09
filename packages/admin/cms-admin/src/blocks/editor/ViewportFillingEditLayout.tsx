import { EditLayout, type EditLayoutProps } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useLayoutEffect, useState } from "react";

/**
 * An `EditLayout` with a preview that fills the window below the top bar: the header stays in view, and the preview and the editor take the
 * remaining height, each scrolling only its own content, so the window itself doesn't scroll. Pass an editor that scrolls its content, e.g.
 * a `Panel` with a scrolling body. Without a preview, e.g. with the `form` variant, the layout grows with its content like an `EditLayout`.
 */
export function ViewportFillingEditLayout(props: EditLayoutProps) {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const fills = props.variant != null && props.variant !== "form";

    useLayoutEffect(() => {
        if (root == null || !fills) {
            return;
        }

        const updateTop = () => {
            const top = root.getBoundingClientRect().top + window.scrollY;
            root.style.setProperty("--viewport-filling-edit-layout-top", `${Math.ceil(top)}px`);
        };
        updateTop();

        const resizeObserver = new ResizeObserver(updateTop);
        resizeObserver.observe(document.body);
        window.addEventListener("resize", updateTop);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateTop);
            root.style.removeProperty("--viewport-filling-edit-layout-top");
        };
    }, [root, fills]);

    return <Root {...props} ref={setRoot} data-viewport-fill={fills ? "" : undefined} />;
}

const Root = styled(EditLayout)`
    &[data-viewport-fill] {
        --viewport-filling-edit-layout-height: calc(
            100dvh - var(--viewport-filling-edit-layout-top, 0px) - var(--dextinity-edit-layout-preview-spacing)
        );

        block-size: var(--viewport-filling-edit-layout-height);
        /* Takes no space in the flow, so the padding the app shell keeps below its content doesn't make the window scroll; the layout's own
           box still counts towards the scrollable area if the window is too low for the preview's minimum height. */
        margin-block-end: calc(-1 * var(--viewport-filling-edit-layout-height));

        .dextinityEditLayout__body {
            flex: 1;
            grid-template-rows: minmax(0, 1fr);
            align-items: stretch;
            min-block-size: var(--dextinity-edit-layout-preview-min-height);
        }

        .dextinityEditLayout__preview {
            position: static;
            block-size: auto;
        }

        .dextinityEditLayout__editor {
            display: flex;
            flex-direction: column;
            min-block-size: 0;

            > * {
                flex: 1;
                min-block-size: 0;
            }
        }
    }
`;
