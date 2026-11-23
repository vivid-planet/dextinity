import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { render, screen } from "test-utils";
import { describe, expect, test } from "vitest";

import { type DateTimeRange, DateTimeRangePicker } from "./DateTimeRangePicker";

function ControlledDateTimeRangePicker({ initialValue }: { initialValue: DateTimeRange }) {
    const [value, setValue] = useState<DateTimeRange | undefined>(initialValue);
    return (
        <>
            <DateTimeRangePicker value={value} onChange={setValue} />
            <output>{value ? `${value.start?.toISOString() ?? "empty"} - ${value.end?.toISOString() ?? "empty"}` : "empty"}</output>
        </>
    );
}

describe("DateTimeRangePicker", () => {
    test("Should keep a typed day that doesn't exist in the current month", async () => {
        const user = userEvent.setup();
        const start = new Date(2026, 10, 1, 10, 0);
        render(<ControlledDateTimeRangePicker initialValue={{ start, end: new Date(2026, 10, 15, 10, 0) }} />);

        await user.click((await screen.findAllByRole("spinbutton", { name: "Day" }))[1]);
        await user.keyboard("31");
        await user.click(screen.getAllByRole("spinbutton", { name: "Month" })[1]);
        await user.keyboard("12");

        expect(screen.getByRole("status")).toHaveTextContent(`${start.toISOString()} - ${new Date(2026, 11, 31, 10, 0).toISOString()}`);
    });
});
