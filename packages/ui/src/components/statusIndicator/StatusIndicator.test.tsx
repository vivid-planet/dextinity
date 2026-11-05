import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusIndicator } from "./StatusIndicator";

afterEach(cleanup);

describe("StatusIndicator", () => {
    it("emits the status as a data attribute and shows the system word without children", () => {
        render(<StatusIndicator status="archived" />);

        const status = screen.getByText("Archived");
        expect([status.className.includes("dextinityStatusIndicator"), status.dataset.status]).toStrictEqual([true, "archived"]);
        expect(status.querySelector(".dextinityStatusIndicator__dot")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("shows custom text in place of the system word", () => {
        render(<StatusIndicator status="published">Active</StatusIndicator>);

        expect(screen.getByText("Active").dataset.status).toBe("published");
        expect(screen.queryByText("Published")).toBeNull();
    });

    it("names the dot with the text when only the dot is shown", () => {
        render(<StatusIndicator status="critical" dotOnly />);

        const status = screen.getByRole("img", { name: "Critical" });
        expect([status.dataset.dotonly, status.textContent]).toStrictEqual(["", ""]);
    });
});
