import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ColumnsBlockLayout } from "../createColumnsBlock";
import { LayoutSelectField } from "./LayoutSelectField";

afterEach(cleanup);

const layouts: ColumnsBlockLayout[] = [
    { name: "9-9", columns: 2, label: "Same width", preview: <span />, section: { name: "same", label: "Equal" } },
    { name: "12-6", columns: 2, label: "Weighted left", preview: <span />, section: { name: "different", label: "Different" } },
];

describe("LayoutSelectField", () => {
    it("holds the chosen layout object", async () => {
        const onChange = vi.fn();
        render(
            <Form<{ layout: ColumnsBlockLayout }> initialValues={{ layout: layouts[0] }} onSubmit={vi.fn()} subscription={{}}>
                {({ form }) => {
                    form.subscribe(({ values }) => onChange(values.layout), { values: true });
                    return <LayoutSelectField name="layout" label="Layout" layouts={layouts} />;
                }}
            </Form>,
        );

        const select = screen.getByRole("combobox", { name: /Layout/ });
        expect(select.textContent).toContain("Same width");

        const user = userEvent.setup();
        await user.click(select);
        await user.click(await screen.findByRole("option", { name: /Weighted left/ }));

        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(layouts[1]));
    });

    it("shows a single layout read-only", () => {
        render(
            <Form initialValues={{ layout: layouts[0] }} onSubmit={vi.fn()}>
                {() => <LayoutSelectField name="layout" label="Layout" layouts={[layouts[0]]} />}
            </Form>,
        );

        expect(screen.getByRole("combobox", { name: /Layout/ }).getAttribute("aria-readonly") ?? "").not.toBe("false");
    });
});
