import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Typography } from "./Typography";

it("renders body text as a paragraph by default", () => {
    render(<Typography>Body text</Typography>);

    expect(screen.getByRole("paragraph")).toHaveTextContent("Body text");
});

it("renders the page title as a level-one heading", () => {
    render(<Typography variant="displayL">Job ads</Typography>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Job ads");
});
