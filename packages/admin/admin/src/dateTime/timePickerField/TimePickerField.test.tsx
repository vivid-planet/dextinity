import userEvent from "@testing-library/user-event";
import { cleanup, render, waitFor, within } from "test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FinalForm } from "../../FinalForm";
import { TimePickerField } from "./TimePickerField";

describe("TimePickerField", () => {
    describe("validation", () => {
        beforeEach(() => {
            vi.stubGlobal("matchMedia", (query: string) => ({
                matches: true,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));
        });

        afterEach(() => {
            vi.unstubAllGlobals();
            cleanup();
        });

        test("Should show error when a time before business hours is selected", async () => {
            const user = userEvent.setup();

            const validateIsBusinessHours = vi.fn(async (value: string | undefined) => {
                if (!value) {
                    return undefined;
                }
                const [hours] = value.split(":").map(Number);
                return hours >= 9 ? undefined : "Please select a time during business hours";
            });

            function Story() {
                return (
                    <FinalForm
                        mode="edit"
                        onSubmit={() => {
                            // not handled
                        }}
                        initialValues={{ value: "08:00" }}
                        subscription={{ values: true }}
                    >
                        {() => (
                            <TimePickerField
                                name="value"
                                label="Time Picker"
                                helperText="Only business hours are valid"
                                fullWidth
                                variant="horizontal"
                                validate={validateIsBusinessHours}
                            />
                        )}
                    </FinalForm>
                );
            }

            const rendered = render(<Story />);

            await user.click(rendered.getByRole("button", { name: "Open time picker" }));

            await waitFor(() => expect(rendered.getByRole("dialog")).toBeInTheDocument());

            const dialog = rendered.getByRole("dialog");
            const firstTimeOption = within(dialog).getAllByRole("option")[0];
            await user.click(firstTimeOption);

            await waitFor(() => expect(rendered.getByText("Please select a time during business hours")).toBeInTheDocument());
            await waitFor(() => expect(validateIsBusinessHours).toHaveBeenCalled());
        }, 15000);
    });
});
