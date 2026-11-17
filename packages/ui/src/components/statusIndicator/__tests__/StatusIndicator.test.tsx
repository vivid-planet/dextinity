import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusIndicator } from "../StatusIndicator";

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

    it("shows the system word from labels", () => {
        render(<StatusIndicator status="running" labels={{ running: "Läuft" }} />);

        expect(screen.getByText("Läuft").dataset.status).toBe("running");
    });

    it("names the dot with the text when only the dot is shown", () => {
        render(<StatusIndicator status="critical" dotOnly />);

        const status = screen.getByRole("img", { name: "Critical" });
        expect([status.dataset.dotonly, status.textContent]).toStrictEqual(["", ""]);
    });

    it("hides a decorative dot from assistive technology, without a tooltip trigger or text", () => {
        const { container } = render(<StatusIndicator status="published" decorative />);

        const status = container.querySelector<HTMLElement>(".dextinityStatusIndicator");
        expect([status?.getAttribute("aria-hidden"), status?.dataset.dotonly, status?.textContent, status?.getAttribute("role")]).toStrictEqual([
            "true",
            "",
            "",
            null,
        ]);
        expect(screen.queryByRole("img")).toBeNull();
    });
});
