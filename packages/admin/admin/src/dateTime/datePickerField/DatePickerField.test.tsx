import userEvent, { type UserEvent } from "@testing-library/user-event";
import { cleanup, render, type RenderResult, waitFor, within } from "test-utils";
import { afterEach, describe, expect, type Mock, test, vi } from "vitest";

import { FinalForm } from "../../FinalForm";
import { DatePickerField } from "./DatePickerField";

describe("DatePickerField", () => {
    describe("paste", () => {
        afterEach(cleanup);

        const renderField = () => {
            const values = vi.fn();

            function Story() {
                return (
                    <FinalForm
                        mode="edit"
                        onSubmit={() => {
                            // not handled
                        }}
                        initialValues={{ value: "2026-03-07" }}
                        subscription={{ values: true }}
                    >
                        {({ values: formValues }) => {
                            values(formValues.value);
                            return <DatePickerField name="value" label="Date Picker" fullWidth />;
                        }}
                    </FinalForm>
                );
            }

            return { values, rendered: render(<Story />) };
        };

        const focusField = async (user: UserEvent, rendered: RenderResult) => {
            await user.click(rendered.getByRole("spinbutton", { name: "Month" }));
        };

        const latestValue = (values: Mock) => values.mock.calls[values.mock.calls.length - 1][0];

        test("Should set the date when an ISO date is pasted", async () => {
            const user = userEvent.setup();
            const { values, rendered } = renderField();

            await focusField(user, rendered);
            await user.paste("2024-01-15");

            await waitFor(() => expect(latestValue(values)).toBe("2024-01-15"));
        }, 15000);

        test("Should set the date when an ISO date with a time part is pasted", async () => {
            const user = userEvent.setup();
            const { values, rendered } = renderField();

            await focusField(user, rendered);
            await user.paste("2024-01-15T14:30:00Z");

            await waitFor(() => expect(latestValue(values)).toBe("2024-01-15"));
        }, 15000);

        test("Should set the date when a date in the field's format is pasted", async () => {
            const user = userEvent.setup();
            const { values, rendered } = renderField();

            await focusField(user, rendered);
            await user.paste("01/15/2024");

            await waitFor(() => expect(latestValue(values)).toBe("2024-01-15"));
        }, 15000);

        test("Should keep pasting into a single section working", async () => {
            const user = userEvent.setup();
            const { values, rendered } = renderField();

            await user.click(rendered.getByRole("spinbutton", { name: "Year" }));
            await user.paste("2024");

            await waitFor(() => expect(latestValue(values)).toBe("2024-03-07"));
        }, 15000);
    });

    describe("validation", () => {
        afterEach(cleanup);

        test("Should show error when weekend date is selected", async () => {
            const user = userEvent.setup();

            const validateIsWeekday = vi.fn(async (value: string | undefined) => {
                if (!value) {
                    return undefined;
                }
                const day = new Date(value).getDay();
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
                        initialValues={{ value: "2026-03-07" }}
                        subscription={{ values: true }}
                    >
                        {() => (
                            <DatePickerField
                                name="value"
                                label="Date Picker"
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

            await user.click(rendered.getByRole("button", { name: "Open date picker" }));

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
