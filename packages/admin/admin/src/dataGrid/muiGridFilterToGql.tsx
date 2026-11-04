import type { GridFilterModel } from "@mui/x-data-grid";

import type { GridColDef } from "./GridColDef";

const muiGridOperatorValueToGqlOperator: { [key: string]: string } = {
    contains: "contains",
    doesNotContain: "notContains",
    equals: "equal",
    doesNotEqual: "notEqual",
    ">": "greaterThan",
    ">=": "greaterThanEqual",
    "<": "lowerThan",
    "<=": "lowerThanEqual",
    "=": "equal",
    "!=": "notEqual",
    startsWith: "startsWith",
    endsWith: "endsWith",
    isAnyOf: "isAnyOf",
    isEmpty: "isEmpty",
    isNotEmpty: "isNotEmpty",
    is: "equal",
    not: "notEqual",
    after: "greaterThan",
    onOrAfter: "greaterThanEqual",
    before: "lowerThan",
    onOrBefore: "lowerThanEqual",
};

interface GqlStringFilter {
    contains?: string | null;
    startsWith?: string | null;
    endsWith?: string | null;
    equal?: string | null;
    notEqual?: string | null;
}
interface GqlNumberFilter {
    equal?: number | null;
    lowerThan?: number | null;
    greaterThan?: number | null;
    lowerThanEqual?: number | null;
    greaterThanEqual?: number | null;
    notEqual?: number | null;
}
interface GqlBooleanFilter {
    equal?: boolean | null;
}
export type GqlFilter = {
    [key: string]: GqlStringFilter | GqlNumberFilter | GqlBooleanFilter | undefined; //TODO add Date, DateTime(?), SingleSelect(??)
} & {
    and?: GqlFilter[] | null;
    or?: GqlFilter[] | null;
};

export function muiGridFilterToGql(columns: GridColDef[], filterModel?: GridFilterModel): { filter: GqlFilter; search?: string } {
    if (!filterModel) {
        return { filter: {} };
    }
    const filterItems = filterModel.items.map((filterItem) => {
        const column = columns.find((col) => col.field === filterItem.field);
        if (column?.toGqlFilter) {
            return column.toGqlFilter(filterItem);
        }
        if (!filterItem.operator) {
            throw new Error("operator not set");
        }
        const gqlOperator = muiGridOperatorValueToGqlOperator[filterItem.operator] || filterItem.operator;
        const value = ["isEmpty", "isNotEmpty"].includes(gqlOperator) ? true : filterItem.value;
        return {
            [filterItem.field]: {
                [gqlOperator]: value,
            } as GqlStringFilter | GqlNumberFilter,
        };
    });
    const filter: GqlFilter = {};
    const op: "and" | "or" = filterModel.logicOperator ?? "and";
    filter[op] = filterItems.filter((item) => item != null);

    let search: undefined | string = undefined;

    if (filterModel.quickFilterValues) {
        search = filterModel.quickFilterValues.join(" ");
    }

    return { filter, search };
}
