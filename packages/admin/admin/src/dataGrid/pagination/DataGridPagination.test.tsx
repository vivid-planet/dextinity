import { formLabelClasses, InputBase } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "../../common/Dialog";
import { FieldContainer } from "../../form/FieldContainer";
import { DataGridPagination } from "./DataGridPagination";

describe("DataGridPagination", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("doesn't log an error when rendered inside a form field", () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        renderGridInsideField();

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining("multiple `InputBase` components inside a FormControl"));
    });

    it("doesn't share the page size select's state with a surrounding form field", async () => {
        renderGridInsideField();

        await userEvent.click(screen.getByRole("combobox"));

        const outerFieldLabel = screen.getByText("Outer field");
        expect(outerFieldLabel).not.toHaveClass(formLabelClasses.focused);
        expect(outerFieldLabel).not.toHaveClass(formLabelClasses.filled);
    });
});

function renderGridInsideField() {
    return render(
        <FieldContainer label="Outer field">
            <InputBase />
            <Dialog open>
                <DataGrid
                    rows={[
                        { id: 1, name: "Chocolate" },
                        { id: 2, name: "Vanilla" },
                    ]}
                    columns={[{ field: "name", headerName: "Name" }]}
                    slots={{ pagination: DataGridPagination }}
                    pageSizeOptions={[1, 2]}
                    initialState={{ pagination: { paginationModel: { pageSize: 1 } } }}
                />
            </Dialog>
        </FieldContainer>,
    );
}
