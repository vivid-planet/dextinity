import { Form } from "react-final-form";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckboxField } from "./CheckboxField";

describe("CheckboxField", () => {
    afterEach(cleanup);

    it("should keep the input slot props of the checkbox together with the Final Form input props", () => {
        render(
            <Form onSubmit={vi.fn()}>
                {() => (
                    <CheckboxField
                        name="test"
                        label="Test"
                        componentsProps={{
                            finalFormCheckbox: { slotProps: { input: { "aria-label": "Accept terms" } } },
                        }}
                    />
                )}
            </Form>,
        );

        const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });
});
