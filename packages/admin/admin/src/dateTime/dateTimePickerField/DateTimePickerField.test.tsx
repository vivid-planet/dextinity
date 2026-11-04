import userEvent from "@testing-library/user-event";
import { cleanup, render, waitFor, within } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { FinalForm } from "../../FinalForm";
import { DateTimePickerField } from "./DateTimePickerField";

describe("DateTimePickerField", () => {
    describe("validation", () => {
        afterEach(cleanup);

        test("Should show error when weekend date is selected", async () => {
            const user = userEvent.setup();

            const validateIsWeekday = vi.fn(async (value: Date | undefined) => {
                if (!value) {
                    return undefined;
                }
                const day = value.getDay();
                const isWeekday = day !== 0 && day !== 6;
                return isWeekday ? undefined : "Please select a weekday";
            });

            function Story() {
                return (
                    <FinalForm
                        mode="edit"
                        onSubmit={() => {
                            // not handled
                        }}
                        initialValues={{ value: new Date(2026, 2, 7) }}
                        subscription={{ values: true }}
                    >
                        {() => (
                            <DateTimePickerField
                                name="value"
                                label="Date Time Picker"
                                helperText="Only weekdays are valid"
                                fullWidth
                                variant="horizontal"
                                validate={validateIsWeekday}
                            />
                        )}
                    </FinalForm>
                );
            }

            const rendered = render(<Story />);

            await user.click(rendered.getByRole("button", { name: "Open date time picker" }));

            await waitFor(() => expect(rendered.getByRole("dialog")).toBeInTheDocument());

            const rowGroup = within(rendered.getByRole("dialog")).getByRole("rowgroup");
            const allRowsOfDays = within(rowGroup).getAllByRole("row");
            const allButtonsInFirstRow = within(allRowsOfDays[0]).getAllByRole("gridcell");
            const lastButtonInFirstRow = allButtonsInFirstRow[allButtonsInFirstRow.length - 1];
            await user.click(lastButtonInFirstRow);

            await waitFor(() => expect(rendered.getByText("Please select a weekday")).toBeInTheDocument());
            await waitFor(() => expect(validateIsWeekday).toHaveBeenCalledTimes(1));
        }, 15000);
    });
});
