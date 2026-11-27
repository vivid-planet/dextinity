import { type RefObject, useEffect, useState } from "react";

interface FramePage {
    /** The location's hash without `#`, which a prototype keeps its page in. */
    hash: string;
    title: string;
}

/**
 * The page the frame shows, updated when the story inside changes its hash or document title, e.g. when a prototype navigates.
 */
export function useFramePage(frameRef: RefObject<HTMLIFrameElement | null>, frameLoadCount: number): FramePage {
    const [page, setPage] = useState<FramePage>({ hash: "", title: "" });

    useEffect(() => {
        const frameWindow = frameRef.current?.contentWindow;
        const frameDocument = frameRef.current?.contentDocument;
        if (!frameWindow || !frameDocument?.head) {
            return;
        }
        const readPage = () => setPage({ hash: frameWindow.location.hash.slice(1), title: frameDocument.title });
        readPage();
        const observer = new MutationObserver(readPage);
        observer.observe(frameDocument.head, { subtree: true, childList: true, characterData: true });
        frameWindow.addEventListener("hashchange", readPage);
        return () => {
            observer.disconnect();
            frameWindow.removeEventListener("hashchange", readPage);
        };
    }, [frameRef, frameLoadCount]);

    return page;
}
