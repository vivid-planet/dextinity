import { renderHook } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { maxTextSelectionLength, useTextSelectionStore } from "./textSelection";

const fireSelectionChange = () => document.dispatchEvent(new Event("selectionchange"));

const selectInTextField = (value: string, { start, end }: { start: number; end: number }) => {
    const input = document.createElement("input");
    input.value = value;
    document.body.appendChild(input);
    input.focus();
    input.setSelectionRange(start, end);
    fireSelectionChange();
    return input;
};

const selectOnPage = (text: string) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    document.body.appendChild(paragraph);
    document.getSelection()?.selectAllChildren(paragraph);
    fireSelectionChange();
    return paragraph;
};

const focusChat = () => {
    const chat = document.createElement("ai-hub-chat");
    chat.tabIndex = 0;
    document.body.appendChild(chat);
    chat.focus();
    document.getSelection()?.collapse(chat);
    fireSelectionChange();
};

describe("useTextSelectionStore", () => {
    afterEach(() => {
        document.getSelection()?.removeAllRanges();
        document.body.replaceChildren();
    });

    it("reads the text selected in a text field", () => {
        const { result } = renderHook(() => useTextSelectionStore());

        selectInTextField("Welcome to our newsletter", { start: 11, end: 25 });

        expect(result.current.getCurrent()).toEqual({ text: "our newsletter", isTruncated: false });
    });

    it("reads the text selected on the page, e.g. in the rich text editor", () => {
        const { result } = renderHook(() => useTextSelectionStore());

        selectOnPage("Spring offers for your car");

        expect(result.current.getCurrent()).toEqual({ text: "Spring offers for your car", isTruncated: false });
    });

    it("keeps the selection while the chat is focused", () => {
        const { result } = renderHook(() => useTextSelectionStore());
        selectOnPage("Spring offers for your car");

        focusChat();

        expect(result.current.getCurrent()).toEqual({ text: "Spring offers for your car", isTruncated: false });
    });

    it("clears the selection when it collapses elsewhere in the admin", () => {
        const { result } = renderHook(() => useTextSelectionStore());
        const paragraph = selectOnPage("Spring offers for your car");

        document.getSelection()?.collapse(paragraph);
        fireSelectionChange();

        expect(result.current.getCurrent()).toBeNull();
    });

    it("forgets the selection when it is cleared, also while the chat is focused", () => {
        const { result } = renderHook(() => useTextSelectionStore());
        selectOnPage("Spring offers for your car");
        focusChat();

        result.current.clear();
        fireSelectionChange();

        expect(result.current.getCurrent()).toBeNull();
    });

    it("ignores a selection of whitespace only", () => {
        const { result } = renderHook(() => useTextSelectionStore());

        selectInTextField("Spring  offers", { start: 6, end: 8 });

        expect(result.current.getCurrent()).toBeNull();
    });

    it("cuts off a long selection and marks it as truncated", () => {
        const { result } = renderHook(() => useTextSelectionStore());
        const text = "a".repeat(maxTextSelectionLength + 1);

        selectInTextField(text, { start: 0, end: text.length });

        expect(result.current.getCurrent()).toEqual({ text: "a".repeat(maxTextSelectionLength), isTruncated: true });
    });

    it("notifies the subscribers only when the selected text changes", () => {
        const { result } = renderHook(() => useTextSelectionStore());
        const listener = vi.fn();
        result.current.subscribe(listener);

        selectOnPage("Spring offers for your car");
        fireSelectionChange();

        expect(listener).toHaveBeenCalledTimes(1);
    });
});
