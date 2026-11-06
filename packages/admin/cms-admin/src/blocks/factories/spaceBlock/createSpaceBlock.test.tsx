import { RouterMemoryRouter } from "@dextinity/admin";
import userEvent from "@testing-library/user-event";
import { FormattedMessage } from "react-intl";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSpaceBlock } from "./createSpaceBlock";

afterEach(cleanup);

describe("createSpaceBlock", () => {
    const SpaceBlock = createSpaceBlock({
        defaultValue: "s",
        options: [
            { value: "s", label: <FormattedMessage id="test.space.small" defaultMessage="Small" /> },
            { value: "l", label: "Large" },
        ],
    });

    it("updates the state with the chosen spacing", async () => {
        const updateState = vi.fn();
        render(
            <RouterMemoryRouter>
                <SpaceBlock.AdminComponent state={{ spacing: "s" }} updateState={updateState} />
            </RouterMemoryRouter>,
        );

        const select = screen.getByRole("combobox", { name: /Spacing/ });
        expect(select.textContent).toContain("Small");

        const user = userEvent.setup();
        await user.click(select);
        await user.click(await screen.findByRole("option", { name: "Large" }));

        await waitFor(() => expect(updateState.mock.calls[0]?.[0]).toEqual({ spacing: "l" }));
    });
});
