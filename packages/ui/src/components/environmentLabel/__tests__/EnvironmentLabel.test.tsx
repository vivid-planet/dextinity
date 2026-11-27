import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EnvironmentLabel } from "../EnvironmentLabel";

afterEach(cleanup);

describe("EnvironmentLabel", () => {
    it("emits its class, color, and variant", () => {
        render(<EnvironmentLabel label="Test" color="success" />);

        const label = screen.getByText("Test");
        expect([label.className.includes("dextinityEnvironmentLabel"), label.dataset.color, label.dataset.variant]).toStrictEqual([
            true,
            "success",
            "default",
        ]);
    });

    it("keeps the full name for screen readers when it shows only the first letter", () => {
        render(<EnvironmentLabel label="Staging" variant="compact" data-testid="label" />);

        const label = screen.getByTestId("label");
        expect([label.textContent, label.dataset.color, label.tabIndex]).toStrictEqual(["SStaging", "warning", 0]);
    });
});
