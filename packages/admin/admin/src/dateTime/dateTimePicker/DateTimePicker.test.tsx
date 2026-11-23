import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { render, screen } from "test-utils";
import { describe, expect, test } from "vitest";

import { DateTimePicker } from "./DateTimePicker";

function ControlledDateTimePicker({ initialValue }: { initialValue: Date }) {
    const [value, setValue] = useState<Date | undefined>(initialValue);
    return (
        <>
            <DateTimePicker value={value} onChange={setValue} />
            <output>{value?.toISOString() ?? "empty"}</output>
        </>
    );
}

describe("DateTimePicker", () => {
    test("Should keep a typed day that doesn't exist in the current month", async () => {
        const user = userEvent.setup();
        render(<ControlledDateTimePicker initialValue={new Date(2026, 10, 15, 10, 0)} />);

        await user.click(screen.getByRole("spinbutton", { name: "Day" }));
        await user.keyboard("31");
        await user.click(screen.getByRole("spinbutton", { name: "Month" }));
        await user.keyboard("12");

        expect(screen.getByRole("status")).toHaveTextContent(new Date(2026, 11, 31, 10, 0).toISOString());
    });
});
