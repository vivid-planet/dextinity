import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckboxGroup, type CheckboxGroupOption } from "../CheckboxGroup";

afterEach(cleanup);

const options: CheckboxGroupOption[] = [
    {
        value: "main",
        label: "Main",
        children: [
            { value: "main-de", label: "German" },
            { value: "main-en", label: "English" },
        ],
    },
    { value: "archive", label: "Archive", description: "Old content" },
];

describe("CheckboxGroup", () => {
    it("emits the orientation and state on the root and names the group", () => {
        const { container } = render(
            <CheckboxGroup
                label="Scopes"
                options={options}
                value={[]}
                onChange={vi.fn()}
                orientation="horizontal"
                state="error"
                validationMessage="Select a scope."
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityCheckboxGroup");
        expect([root.dataset.orientation, root.dataset.state, root.dataset.selectablegroups]).toStrictEqual(["horizontal", "error", ""]);
        const group = screen.getByRole("group", { name: "Scopes" });
        expect(group).toHaveAccessibleDescription("Select a scope.");
        expect(group.getAttribute("aria-invalid")).toBe("true");
    });

    it("derives a group's checkbox from the options inside it and names the nested group by it", () => {
        render(<CheckboxGroup aria-label="Scopes" options={options} value={["main-en"]} onChange={vi.fn()} />);

        expect(screen.getByRole("checkbox", { name: "Main" }).getAttribute("aria-checked")).toBe("mixed");
        expect(screen.getByRole("group", { name: "Main" })).toContainElement(screen.getByRole("checkbox", { name: "English" }));
    });

    it("shows a group as a heading without selectableGroups", () => {
        render(<CheckboxGroup aria-label="Scopes" options={options} value={[]} onChange={vi.fn()} selectableGroups={false} />);

        expect(screen.queryByRole("checkbox", { name: "Main" })).toBeNull();
        expect(screen.getByText("Main").className).toBe("dextinityCheckboxGroup__groupHeading");
        expect(screen.getByRole("group", { name: "Main" })).toBeInTheDocument();
    });
});
