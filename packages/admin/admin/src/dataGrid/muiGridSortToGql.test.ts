import type { GridSortModel } from "@mui/x-data-grid";
import { describe, expect, it } from "vitest";

import type { GridColDef } from "./GridColDef";
import { muiGridSortToGql } from "./muiGridSortToGql";

describe("muiGridSortToGql", () => {
    it("returns undefined when sortModel is undefined", () => {
        expect(muiGridSortToGql(undefined)).toBeUndefined();
    });

    it("returns undefined when sortModel is empty", () => {
        expect(muiGridSortToGql([])).toBeUndefined();
    });

    it("converts a single ascending sort to GQL format", () => {
        const sortModel: GridSortModel = [{ field: "name", sort: "asc" }];
        expect(muiGridSortToGql(sortModel)).toEqual([{ field: "name", direction: "ASC" }]);
    });

    it("converts a single descending sort to GQL format", () => {
        const sortModel: GridSortModel = [{ field: "createdAt", sort: "desc" }];
        expect(muiGridSortToGql(sortModel)).toEqual([{ field: "createdAt", direction: "DESC" }]);
    });

    it("converts multiple sort fields to GQL format", () => {
        const sortModel: GridSortModel = [
            { field: "lastName", sort: "asc" },
            { field: "firstName", sort: "desc" },
        ];
        expect(muiGridSortToGql(sortModel)).toEqual([
            { field: "lastName", direction: "ASC" },
            { field: "firstName", direction: "DESC" },
        ]);
    });

    it("maps a field to a different GQL field when column has a string sortBy", () => {
        const sortModel: GridSortModel = [{ field: "fullName", sort: "asc" }];
        const columns: GridColDef[] = [{ field: "fullName", sortBy: "name" }];
        expect(muiGridSortToGql(sortModel, columns)).toEqual([{ field: "name", direction: "ASC" }]);
    });

    it("expands a field to multiple GQL fields when column has an array sortBy", () => {
        const sortModel: GridSortModel = [{ field: "fullName", sort: "desc" }];
        const columns: GridColDef[] = [{ field: "fullName", sortBy: ["lastName", "firstName"] }];
        expect(muiGridSortToGql(sortModel, columns)).toEqual([
            { field: "lastName", direction: "DESC" },
            { field: "firstName", direction: "DESC" },
        ]);
    });

    it("uses the field name as-is when no columns are provided", () => {
        const sortModel: GridSortModel = [{ field: "status", sort: "asc" }];
        expect(muiGridSortToGql(sortModel, undefined)).toEqual([{ field: "status", direction: "ASC" }]);
    });

    it("uses field name as-is for columns without a sortBy definition", () => {
        const sortModel: GridSortModel = [{ field: "email", sort: "asc" }];
        const columns: GridColDef[] = [{ field: "email" }];
        expect(muiGridSortToGql(sortModel, columns)).toEqual([{ field: "email", direction: "ASC" }]);
    });

    it("treats null sort value as ascending direction", () => {
        const sortModel: GridSortModel = [{ field: "title", sort: null }];
        expect(muiGridSortToGql(sortModel)).toEqual([{ field: "title", direction: "ASC" }]);
    });
});
