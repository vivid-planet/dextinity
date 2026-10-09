import { type TypedDocumentNode, useQuery } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { MuiThemeProvider, SnackbarProvider } from "@dextinity/admin";
import { createTheme } from "@mui/material";
import type { PropsWithChildren } from "react";
import { IntlProvider } from "react-intl";
import { act, renderHook } from "test-utils";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import type { BlockInterface } from "../blocks/types";
import { createUsePage } from "./createUsePage";

vi.mock(import("@apollo/client"), async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
        useQuery: vi.fn(),
    };
});

type TextBlockState = { text: string };

const TextBlock = {
    name: "Text",
    defaultValues: () => ({ text: "" }),
    input2State: (input: TextBlockState | null) => ({ text: input?.text ?? "" }),
    state2Output: (state: TextBlockState) => ({ text: state.text }),
    isValid: () => true,
    AdminComponent: () => null,
} as unknown as BlockInterface;

type EditPageQuery = {
    page: {
        id: string;
        path: string;
        document: {
            __typename: "Page";
            id: string;
            updatedAt: string;
            content: TextBlockState;
        } | null;
    } | null;
};

const usePage = createUsePage({ rootBlocks: { content: TextBlock }, pageType: "Page" })<EditPageQuery>({
    // The queries are never executed because `useQuery` is mocked and the page isn't saved in these tests.
    getQuery: {} as TypedDocumentNode<EditPageQuery, { id: string }>,
    updateMutation: {} as TypedDocumentNode<{ id: string } & { content: unknown }, { pageId: string; input: { content: unknown } }>,
});

function Providers({ children }: PropsWithChildren) {
    return (
        <MockedProvider>
            <IntlProvider locale="en">
                <MuiThemeProvider theme={createTheme()}>
                    <SnackbarProvider>{children}</SnackbarProvider>
                </MuiThemeProvider>
            </IntlProvider>
        </MockedProvider>
    );
}

describe("createUsePage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (useQuery as Mock).mockReturnValue({
            loading: false,
            data: {
                page: {
                    id: "page-tree-node-id",
                    path: "/example",
                    document: {
                        __typename: "Page",
                        id: "page-id",
                        updatedAt: "2026-01-01T00:00:00.000Z",
                        content: { text: "Content from the api" },
                    },
                },
            } satisfies EditPageQuery,
            error: undefined,
            refetch: vi.fn(),
        });
    });

    it("initializes the page state with the block states of the loaded document", () => {
        const { result } = renderHook(() => usePage({ pageId: "page-tree-node-id" }), { wrapper: Providers });

        expect(result.current.pageState?.path).toBe("/example");
        expect(result.current.pageState?.document?.content).toEqual({ text: "Content from the api" });
        expect(result.current.hasChanges).toBe(false);
    });

    it("applies changes made through setPageState", () => {
        const { result } = renderHook(() => usePage({ pageId: "page-tree-node-id" }), { wrapper: Providers });

        act(() => {
            result.current.setPageState((pageState) => {
                if (!pageState?.document) {
                    return pageState;
                }
                return { ...pageState, document: { ...pageState.document, content: { text: "Content set from outside" } } };
            });
        });

        expect(result.current.pageState?.document?.content).toEqual({ text: "Content set from outside" });
        expect(result.current.hasChanges).toBe(true);
    });
});
