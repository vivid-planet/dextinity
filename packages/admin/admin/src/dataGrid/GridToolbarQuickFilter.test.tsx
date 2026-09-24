import { DataGrid } from "@mui/x-data-grid";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { DataGridToolbar } from "../common/toolbar/DataGridToolbar";
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
    afterEach(cleanup);

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
});
