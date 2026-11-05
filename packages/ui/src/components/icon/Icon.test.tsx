import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { Icon } from "./Icon";

it("reads its glyph from the icon's CSS variable, so brands can replace it", () => {
    const { container } = render(<Icon name="search" />);
    const icon = container.firstElementChild as HTMLElement;

    expect(icon).toHaveClass("dextinityIcon");
    expect(icon.style.getPropertyValue("--dextinity-icon-glyph")).toBe("var(--dextinity-icon-search)");
});

it("is decorative without a label and an image with one", () => {
    const { container, getByRole } = render(
        <>
            <Icon name="search" />
            <Icon name="warning" label="Warning" />
        </>,
    );

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(getByRole("img")).toHaveAccessibleName("Warning");
});

it("emits size and duotone as data attributes", () => {
    const { container } = render(<Icon name="recent" size="large" duotone />);

    expect(container.firstElementChild).toHaveAttribute("data-size", "large");
    expect(container.firstElementChild).toHaveAttribute("data-duotone");
});
