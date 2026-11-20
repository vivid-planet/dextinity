import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserMenu } from "../UserMenu";

afterEach(cleanup);

describe("UserMenu render contract", () => {
    it("names the trigger after the person and emits the placement", () => {
        render(<UserMenu name="Max Mustermann" open={false} onOpenChange={vi.fn()} />);

        const trigger = screen.getByRole("button", { name: "Account: Max Mustermann" });
        expect(trigger.className).toContain("dextinityUserMenu");
        expect(trigger.dataset.placement).toBe("bottom-end");
    });
});
