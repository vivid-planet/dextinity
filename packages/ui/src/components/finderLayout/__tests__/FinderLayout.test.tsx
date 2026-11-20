import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FinderLayout } from "../FinderLayout";

afterEach(cleanup);

describe("FinderLayout", () => {
    it("renders the header and the finder window as contract parts", () => {
        const { container } = render(
            <FinderLayout header="Assets" slotProps={{ window: { className: "consumer-class" } }}>
                Finder
            </FinderLayout>,
        );

        expect((container.firstElementChild as HTMLElement).className).toContain("dextinityFinderLayout");
        expect(screen.getByText("Assets").className).toContain("dextinityFinderLayout__header");
        const window = screen.getByText("Finder");
        expect(window.className).toContain("dextinityFinderLayout__window");
        expect(window.className).toContain("consumer-class");
    });
});
