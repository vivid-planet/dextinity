import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Avatar, getInitials } from "../Avatar";

afterEach(cleanup);

describe("getInitials", () => {
    it("takes the first letters of the first and the last word", () => {
        expect([getInitials("Maria Muster"), getInitials("anna b. König"), getInitials("  Ömer  "), getInitials("")]).toStrictEqual([
            "MM",
            "AK",
            "Ö",
            "",
        ]);
    });
});

describe("Avatar", () => {
    it("is named by the full name and emits its size", () => {
        render(<Avatar name="Maria Muster" size="small" />);

        const avatar = screen.getByRole("img", { name: "Maria Muster" });
        expect([avatar.className.includes("dextinityAvatar"), avatar.dataset.size, avatar.textContent]).toStrictEqual([true, "small", "MM"]);
    });
});
