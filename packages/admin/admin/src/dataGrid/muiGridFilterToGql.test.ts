import { type GridFilterModel, GridLogicOperator } from "@mui/x-data-grid";
import { describe, expect, it } from "vitest";

import type { GridColDef } from "./GridColDef";
import { muiGridFilterToGql } from "./muiGridFilterToGql";

const columns: GridColDef<{ tag: string }>[] = [{ field: "tag" }];

const mockedFilterModelAndOperator: GridFilterModel = {
    items: [
        {
            field: "tag",
            operator: "contains",
            id: 1,
            value: "de",
        },
        {
            field: "tag",
            operator: "contains",
            id: 2,
            value: "en",
        },
    ],
    logicOperator: GridLogicOperator.And,
};

const mockedFilterModelOrOperator: GridFilterModel = {
    items: [
        {
            field: "tag",
            operator: "contains",
            id: 1,
            value: "de",
        },
        {
            field: "tag",
            operator: "contains",
            id: 2,
            value: "en",
        },
    ],
    logicOperator: GridLogicOperator.Or,
};
const mockedFilterModelWithoutOperator: GridFilterModel = {
    items: [
        {
            field: "tag",
            operator: "contains",
            id: 1,
            value: "de",
        },
        {
            field: "tag",
            operator: "contains",
            id: 2,
            value: "en",
        },
    ],
};

describe("muiGridFilterToGql", () => {
    it("should use correct and filter for specified and operator", () => {
        const result = muiGridFilterToGql(columns, mockedFilterModelAndOperator);

        expect(result).toEqual({ filter: { and: [{ tag: { contains: "de" } }, { tag: { contains: "en" } }] } });
    });

    it("should use correct or filter for specified or operator", () => {
        const result = muiGridFilterToGql(columns, mockedFilterModelOrOperator);

        expect(result).toEqual({ filter: { or: [{ tag: { contains: "de" } }, { tag: { contains: "en" } }] } });
    });

    it("should use correct and filter for no operator specified ", () => {
        const result = muiGridFilterToGql(columns, mockedFilterModelWithoutOperator);

        expect(result).toEqual({ filter: { and: [{ tag: { contains: "de" } }, { tag: { contains: "en" } }] } });
    });
});
