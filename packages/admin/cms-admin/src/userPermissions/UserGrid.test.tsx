import type { DocumentNode } from "@apollo/client";
import type { GridColDef } from "@comet/admin";
import { cleanup, render } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserPermissionsUserGrid } from "./UserGrid";
import type { GQLUserAvailablePermissionsAndContentScopesQuery } from "./UserGrid.generated";

let mockAvailablePermissionsAndContentScopes: GQLUserAvailablePermissionsAndContentScopesQuery | undefined;
let gridColumns: GridColDef[] = [];

vi.mock("@apollo/client", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@apollo/client")>();
    return {
        ...actual,
        useQuery: (query: DocumentNode) => {
            const isAvailablePermissionsQuery = query.definitions.some(
                (definition) => definition.kind === "OperationDefinition" && definition.name?.value === "UserAvailablePermissionsAndContentScopes",
            );
            return isAvailablePermissionsQuery ? { data: mockAvailablePermissionsAndContentScopes } : { data: undefined, loading: true };
        },
    };
});

vi.mock("@comet/admin", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@comet/admin")>();
    return {
        ...actual,
        useDataGridRemote: () => ({ paginationModel: { page: 0, pageSize: 25 }, sortModel: [], filterModel: { items: [] } }),
        usePersistentColumnState: () => ({}),
    };
});

vi.mock("./hooks/currentUser", () => ({
    useUserPermissionCheck: () => () => true,
}));

vi.mock("../dataGrid/DataGrid", () => ({
    DataGrid: ({ columns }: { columns: GridColDef[] }) => {
        gridColumns = columns;
        return null;
    },
}));

describe("UserPermissionsUserGrid", () => {
    afterEach(cleanup);

    it("should build the columns from the available permissions once they have loaded", () => {
        mockAvailablePermissionsAndContentScopes = undefined;
        const rendered = render(<UserPermissionsUserGrid />);

        mockAvailablePermissionsAndContentScopes = { permissions: ["pageTree", "dam"], contentScopes: [] };
        rendered.rerender(<UserPermissionsUserGrid />);

        expect(gridColumns.map((column) => column.field)).toEqual(["name", "email", "permission", "scopesInfo", "actions"]);
        expect(gridColumns.find((column) => column.field === "permission")).toMatchObject({ valueOptions: ["pageTree", "dam"] });
    });
});
