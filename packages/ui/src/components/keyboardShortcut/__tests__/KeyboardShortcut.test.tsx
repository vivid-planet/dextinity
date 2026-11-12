import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyboardShortcut } from "../KeyboardShortcut";

afterEach(cleanup);

describe("KeyboardShortcut", () => {
    it("renders a kbd element with the contract class merged with the consumer class", () => {
        render(<KeyboardShortcut className="consumer-class">⌘K</KeyboardShortcut>);

        const key = screen.getByText("⌘K");
        expect(key.tagName).toBe("KBD");
        expect(key.className).toContain("dextinityKeyboardShortcut");
        expect(key.className).toContain("consumer-class");
    });
});
