import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "../input/Input";
import { FieldActions } from "./FieldActions";

afterEach(cleanup);

describe("FieldActions", () => {
    it("emits the shown actions as data attributes and renders one button per action", () => {
        render(<FieldActions data-testid="actions" translate />);

        const actions = screen.getByTestId("actions");
        expect(actions.className).toContain("dextinityFieldActions");
        expect([actions.hasAttribute("data-translate"), actions.hasAttribute("data-aiassist")]).toStrictEqual([true, false]);
        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toStrictEqual(["Translate"]);
    });

    it("disables the actions of a disabled field", () => {
        render(<Input name="title" label="Title" value="" onChange={vi.fn()} disabled actions={<FieldActions translate aiAssist />} />);

        for (const button of screen.getAllByRole("button")) {
            expect(button).toHaveProperty("disabled", true);
        }
    });
});
