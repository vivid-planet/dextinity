import { formLabelClasses, InputBase } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "../common/Dialog";
import { DataGridToolbar } from "../common/toolbar/DataGridToolbar";
import { FieldContainer } from "../form/FieldContainer";
import { GridToolbarQuickFilter } from "./GridToolbarQuickFilter";

const rows = [
    { id: 1, name: "Chocolate" },
    { id: 2, name: "Vanilla" },
];

function Toolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
        </DataGridToolbar>
    );
}

function Grid() {
    return <DataGrid rows={rows} columns={[{ field: "name", headerName: "Name" }]} showToolbar slots={{ toolbar: Toolbar }} />;
}

describe("GridToolbarQuickFilter", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("renders the search field as a searchbox", () => {
        render(<Grid />);

        expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("filters the rows by the entered term", async () => {
        render(<Grid />);

        await userEvent.type(screen.getByRole("searchbox"), "Vanilla");

        await waitFor(() => {
            expect(screen.queryByText("Chocolate")).not.toBeInTheDocument();
        });
        expect(screen.getByText("Vanilla")).toBeInTheDocument();
    });

    it("clears the term and shows all rows again", async () => {
        render(<Grid />);

        await userEvent.type(screen.getByRole("searchbox"), "Vanilla");
        await userEvent.click(await screen.findByRole("button", { name: "Clear" }));

        await waitFor(() => {
            expect(screen.getByText("Chocolate")).toBeInTheDocument();
        });
        expect(screen.getByRole("searchbox")).toHaveValue("");
    });

    it("doesn't log an error when rendered inside a form field", () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        renderGridInsideField();

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining("multiple `InputBase` components inside a FormControl"));
    });

    it("doesn't share its state with a surrounding form field", async () => {
        renderGridInsideField();

        await userEvent.type(screen.getByRole("searchbox"), "Vanilla");

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
                <DataGrid rows={rows} columns={[{ field: "name", headerName: "Name" }]} showToolbar slots={{ toolbar: Toolbar }} hideFooter />
            </Dialog>
        </FieldContainer>,
    );
}
