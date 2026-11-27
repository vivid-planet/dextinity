import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { usePopupOpen } from "../usePopupOpen";

afterEach(() => {
    cleanup();
    document.body.replaceChildren();
});

function addFrame(parentDocument: Document) {
    const frame = parentDocument.createElement("iframe");
    parentDocument.body.append(frame);
    return frame;
}

function getFrameDocument(frame: HTMLIFrameElement) {
    if (!frame.contentDocument) {
        throw new Error("The frame has no document");
    }
    return frame.contentDocument;
}

function pressIn(target: EventTarget) {
    act(() => {
        target.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
}

function renderOpenPopup() {
    const hook = renderHook(() => usePopupOpen());
    act(() => hook.result.current[1](true));
    return hook;
}

describe("usePopupOpen", () => {
    it("closes on a press in a frame, also when the frame's own listeners stop it", () => {
        const frame = addFrame(document);
        const frameDocument = getFrameDocument(frame);
        frameDocument.addEventListener("pointerdown", (event) => event.stopPropagation(), true);
        const { result } = renderOpenPopup();

        pressIn(frameDocument.body);

        expect(result.current[0]).toBe(false);
    });

    it("closes on a press in a nested frame", () => {
        const nestedFrame = addFrame(getFrameDocument(addFrame(document)));
        const { result } = renderOpenPopup();

        pressIn(getFrameDocument(nestedFrame).body);

        expect(result.current[0]).toBe(false);
    });

    it("stays open on a press or key in the Workbench's own document", () => {
        addFrame(document);
        const { result } = renderOpenPopup();

        pressIn(document.body);
        act(() => {
            document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
        });

        expect(result.current[0]).toBe(true);
    });

    it("closes when the focus moves into a frame, but not when the browser window loses the focus", () => {
        const frame = addFrame(document);
        const { result } = renderOpenPopup();

        act(() => {
            window.dispatchEvent(new Event("blur"));
        });
        expect(result.current[0]).toBe(true);

        frame.focus();
        act(() => {
            window.dispatchEvent(new Event("blur"));
        });
        expect(result.current[0]).toBe(false);
    });
});
