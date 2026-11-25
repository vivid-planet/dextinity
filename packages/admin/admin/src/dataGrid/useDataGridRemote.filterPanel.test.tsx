import { DataGrid, type GridFilterModel, GridPreferencePanelsValue } from "@mui/x-data-grid";
import userEvent from "@testing-library/user-event";
import queryString from "query-string";
import type { Location } from "react-router";
import { cleanup, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { useDataGridRemote } from "./useDataGridRemote";

const rows = [
    { id: 1, name: "Lars" },
    { id: 2, name: "Anna" },
];

function RemoteGrid() {
    const dataGridProps = useDataGridRemote();
    return (
        <DataGrid
            {...dataGridProps}
            rows={rows}
            rowCount={rows.length}
            columns={[{ field: "name", headerName: "Name" }]}
            initialState={{ preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters } }}
        />
    );
}

describe("useDataGridRemote in the filter panel", () => {
    afterEach(() => {
        cleanup();
    });

    it("keeps the first character typed into the filter value", async () => {
        const filterWithoutValue: GridFilterModel = { items: [{ id: 1, field: "name", operator: "contains" }] };
        let currentLocation: Location | undefined;

        render(
            <>
                <RemoteGrid />
                <LocationSpy
                    onChange={(location) => {
                        currentLocation = location;
                    }}
                />
            </>,
            { initialEntries: [`?${queryString.stringify({ filter: JSON.stringify(filterWithoutValue) })}`] },
        );

        const valueInput = await screen.findByPlaceholderText("Filter value");
        await userEvent.type(valueInput, "L");

        await waitFor(() => {
            expect(currentLocation?.search).toContain(encodeURIComponent('"value":"L"'));
        });
        expect(valueInput).toHaveValue("L");
    });
});
