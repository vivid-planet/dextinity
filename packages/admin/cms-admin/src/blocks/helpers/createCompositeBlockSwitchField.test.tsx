import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCompositeBlockSwitchField } from "./createCompositeBlockSwitchField";

afterEach(cleanup);

describe("createCompositeBlockSwitchField", () => {
    it("updates the state when the switch is toggled", async () => {
        const [block] = createCompositeBlockSwitchField({ label: "Full width" });
        const updateState = vi.fn();
        render(<block.AdminComponent state={false} updateState={updateState} />);

        const control = screen.getByRole("switch", { name: "Full width" });
        expect(control.getAttribute("aria-checked")).toBe("false");
        fireEvent.click(control);

        await waitFor(() => expect(updateState).toHaveBeenLastCalledWith(true));
    });
});
