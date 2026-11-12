import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyboardKey } from "../KeyboardKey";

afterEach(cleanup);

describe("KeyboardKey", () => {
    it("renders a kbd element with the contract class merged with the consumer class", () => {
        render(<KeyboardKey className="consumer-class">⌘K</KeyboardKey>);

        const key = screen.getByText("⌘K");
        expect(key.tagName).toBe("KBD");
        expect(key.className).toContain("dextinityKeyboardKey");
        expect(key.className).toContain("consumer-class");
    });
});
