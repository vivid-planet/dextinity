import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ColumnsSelectField } from "./ColumnsSelectField";

afterEach(cleanup);

describe("ColumnsSelectField", () => {
    it("holds the chosen number of columns", async () => {
        const onChange = vi.fn();
        render(
            <Form<{ columns: number }> initialValues={{ columns: 1 }} onSubmit={vi.fn()} subscription={{}}>
                {({ form }) => {
                    form.subscribe(({ values }) => onChange(values.columns), { values: true });
                    return <ColumnsSelectField name="columns" label="Columns" columns={[1, 2, 3]} />;
                }}
            </Form>,
        );

        expect(screen.getByRole("group", { name: "Columns" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "1 column" }).getAttribute("aria-pressed")).toBe("true");

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "3 columns" }));

        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(3));
    });
});
