import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Kbd } from "../Kbd";

afterEach(cleanup);

describe("Kbd", () => {
    it("renders a kbd element with the contract class merged with the consumer class", () => {
        render(<Kbd className="consumer-class">⌘K</Kbd>);

        const key = screen.getByText("⌘K");
        expect(key.tagName).toBe("KBD");
        expect(key.className).toContain("dextinityKbd");
        expect(key.className).toContain("consumer-class");
    });
});
