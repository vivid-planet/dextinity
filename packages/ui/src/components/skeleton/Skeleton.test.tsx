import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

afterEach(cleanup);

describe("Skeleton", () => {
    it("repeats the shape, hides it from assistive technology, and applies the width", () => {
        const { container } = render(<Skeleton variant="row" count={3} width={320} className="consumer-class" />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySkeleton");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.variant).toBe("row");
        expect(root.getAttribute("aria-hidden")).toBe("true");
        expect(root.style.inlineSize).toBe("320px");
        expect(root.querySelectorAll(".dextinitySkeleton__item")).toHaveLength(3);
    });

    it("shortens the last of several text lines", () => {
        const { container } = render(<Skeleton count={2} />);

        const shapes = container.querySelectorAll(".dextinitySkeleton__shape");
        expect(shapes[0].className).not.toContain("dextinitySkeleton__lastLine");
        expect(shapes[1].className).toContain("dextinitySkeleton__lastLine");
    });
});
