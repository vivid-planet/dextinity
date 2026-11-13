import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
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
    it("follows the surrounding field and emits the orientation and state on the root", () => {
        const { container } = render(
            <Field label="Scopes" layout="group" required disabled state="error" validationMessage="Select a scope.">
                <CheckboxGroup options={options} value={[]} onChange={vi.fn()} orientation="horizontal" />
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinityCheckboxGroup");
        expect([root?.dataset.orientation, root?.dataset.invalid, root?.dataset.required, root?.dataset.selectablegroups]).toStrictEqual([
            "horizontal",
            "",
            "",
            "",
        ]);
        const group = screen.getByRole("group", { name: "Scopes" });
        expect(group).toHaveAccessibleDescription("Select a scope.");
        expect(group.getAttribute("aria-invalid")).toBe("true");
        expect(group.getAttribute("aria-required")).toBe("true");
        const archive = screen.getByRole("checkbox", { name: /^Archive/ });
        expect(archive).toHaveAttribute("aria-invalid", "true");
        expect(archive).toHaveAttribute("aria-disabled", "true");
        expect(archive).not.toHaveAttribute("aria-required");
    });

    it("derives a group's checkbox from the options inside it and names the nested group by it", () => {
        render(<CheckboxGroup aria-label="Scopes" options={options} value={["main-en"]} onChange={vi.fn()} />);

        expect(screen.getByRole("checkbox", { name: "Main" }).getAttribute("aria-checked")).toBe("mixed");
        expect(screen.getByRole("group", { name: "Main" })).toContainElement(screen.getByRole("checkbox", { name: "English" }));
    });

    it("disables a group whose options are all disabled", () => {
        const assignedOptions: CheckboxGroupOption[] = [
            {
                value: "main",
                label: "Main",
                children: [
                    { value: "main-de", label: "German", disabled: true },
                    { value: "main-en", label: "English", disabled: true },
                ],
            },
            { value: "archive", label: "Archive" },
        ];
        render(<CheckboxGroup aria-label="Scopes" options={assignedOptions} value={["main-de", "main-en"]} onChange={vi.fn()} />);

        expect(screen.getByRole("checkbox", { name: "Main" }).getAttribute("aria-disabled")).toBe("true");
        expect(screen.getByRole("checkbox", { name: "Archive" }).getAttribute("aria-disabled")).toBeNull();
    });

    it("shows a group as a heading without selectableGroups", () => {
        render(<CheckboxGroup aria-label="Scopes" options={options} value={[]} onChange={vi.fn()} selectableGroups={false} />);

        expect(screen.queryByRole("checkbox", { name: "Main" })).toBeNull();
        expect(screen.getByText("Main").className).toBe("dextinityCheckboxGroup__groupHeading");
        expect(screen.getByRole("group", { name: "Main" })).toBeInTheDocument();
    });
});
