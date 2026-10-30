import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Typography } from "./Typography";

it("renders body text as a paragraph by default", () => {
    render(<Typography>Body text</Typography>);

    expect(screen.getByRole("paragraph")).toHaveTextContent("Body text");
});
