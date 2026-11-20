import { render, waitFor } from "test-utils";
import { describe, expect, test } from "vitest";

import { TimeRangePicker } from "./TimeRangePicker";

describe("TimeRangePicker", () => {
    test("Should apply the slot props of the open picker button", async () => {
        const rendered = render(<TimeRangePicker slotProps={{ root: { slotProps: { openPickerButton: { "aria-label": "Choose times" } } } }} />);

        await waitFor(() => expect(rendered.getAllByRole("button", { name: "Choose times" })).toHaveLength(2));
    });
});
