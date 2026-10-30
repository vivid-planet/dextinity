import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Spinner } from "./Spinner";

afterEach(cleanup);

describe("Spinner owner state", () => {
    it("emits the size as a data attribute, with its default when unset", () => {
        render(
            <>
                <Spinner aria-label="Loading pages" />
                <Spinner aria-label="Loading files" size="xl" />
            </>,
        );

        expect(screen.getByRole("progressbar", { name: "Loading pages" }).dataset.size).toBe("md");
        expect(screen.getByRole("progressbar", { name: "Loading files" }).dataset.size).toBe("xl");
    });
});

describe("Spinner accessibility", () => {
    it("is hidden from assistive technology without a name", () => {
        render(<Spinner data-testid="spinner" />);

        expect(screen.queryByRole("progressbar")).toBeNull();
        expect(screen.getByTestId("spinner").getAttribute("aria-hidden")).toBe("true");
    });
});
