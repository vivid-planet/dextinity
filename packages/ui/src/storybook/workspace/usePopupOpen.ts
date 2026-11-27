import { useEffect, useState } from "react";

function watchFramePresses(frame: HTMLIFrameElement, onPress: () => void) {
    let stopWatchingDocument = watchDocumentPresses(frame, onPress);
    // Each load brings a new window, which has none of the listeners of the one before
    const handleLoad = () => {
        stopWatchingDocument();
        stopWatchingDocument = watchDocumentPresses(frame, onPress);
    };
    frame.addEventListener("load", handleLoad);
    return () => {
        frame.removeEventListener("load", handleLoad);
        stopWatchingDocument();
    };
}

function watchDocumentPresses(frame: HTMLIFrameElement, onPress: () => void) {
    // `null` for a frame of another origin, which the window's blur covers instead
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow) {
        return () => {};
    }
    // On the window and in the capture phase, so that the frame's tools, which stop the page's own pointer events, don't stop it
    frameWindow.addEventListener("pointerdown", onPress, true);
    const stopWatchingNestedFrames = watchAllFramePresses(frameDocument, onPress);
    return () => {
        frameWindow.removeEventListener("pointerdown", onPress, true);
        stopWatchingNestedFrames();
    };
}

function watchAllFramePresses(ownerDocument: Document, onPress: () => void) {
    const stopWatching = Array.from(ownerDocument.querySelectorAll("iframe"), (frame) => watchFramePresses(frame, onPress));
    return () => stopWatching.forEach((stop) => stop());
}

/**
 * The open state of one of the Workbench's popovers or menus, which also closes it on a press in any of the Workbench's frames, e.g.
 * the prototype, the compare frames, or Storybook's UI. A press in a frame never reaches the Workbench's document, so the popup's own
 * outside press detection doesn't see it.
 *
 * It listens for presses in each frame of the same origin, also in nested frames and after a frame loads another document, because a
 * tool in the frame may block the press's focus change. Moving the focus into a frame, which also covers frames of another origin and
 * frames added while the popup is open, closes it too.
 */
export function usePopupOpen() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }
        const close = () => setOpen(false);
        // The window also blurs when the browser window loses the focus; then the focused element stays where it was
        const handleBlur = () => {
            if (document.activeElement instanceof HTMLIFrameElement) {
                close();
            }
        };
        window.addEventListener("blur", handleBlur);
        const stopWatchingFrames = watchAllFramePresses(document, close);
        return () => {
            window.removeEventListener("blur", handleBlur);
            stopWatchingFrames();
        };
    }, [open]);

    return [open, setOpen] as const;
}
