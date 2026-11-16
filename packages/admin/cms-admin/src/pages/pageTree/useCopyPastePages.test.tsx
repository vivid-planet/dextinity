import { useApolloClient } from "@apollo/client/react";
import { renderHook } from "test-utils";
import { describe, expect, it, type Mock, vi } from "vitest";

import { usePageTreeScope } from "../config/usePageTreeScope";
import { usePageTreeConfig } from "../pageTreeConfig";
import { useCopyPastePages } from "./useCopyPastePages";
import type { GQLPageTreePageFragment } from "./usePageTree";
import { usePageTreeContext } from "./usePageTreeContext";

vi.mock(import("@apollo/client/react"), async (importOriginal) => ({ ...(await importOriginal()), useApolloClient: vi.fn() }));
vi.mock("../../config/DextinityConfigContext", () => ({ useDextinityConfig: () => ({ apiUrl: "" }) }));
vi.mock("../../dam/config/damConfig", () => ({ useDamBasePath: () => "" }));
vi.mock("../../dam/config/useDamScope", () => ({ useDamScope: () => ({}) }));
vi.mock("../config/usePageTreeScope", () => ({ usePageTreeScope: vi.fn() }));
vi.mock("../pageTreeConfig", () => ({ usePageTreeConfig: vi.fn() }));
vi.mock("./usePageTreeContext", () => ({ usePageTreeContext: vi.fn() }));

const page = (id: string, parentId: string | null) => ({ id, parentId, documentType: "Page" }) as GQLPageTreePageFragment;

describe("useCopyPastePages", () => {
    it("keeps the order of the pages when their documents are fetched in a different order", async () => {
        const responseDelays: Record<string, number> = { a: 30, aa: 20, ab: 10, b: 0 };
        (useApolloClient as Mock).mockReturnValue({
            query: ({ variables }: { variables: { id: string } }) =>
                new Promise((resolve) =>
                    setTimeout(() => resolve({ data: { page: { document: { id: `document-${variables.id}` } } } }), responseDelays[variables.id]),
                ),
        });
        (usePageTreeScope as Mock).mockReturnValue({ domain: "main" });
        (usePageTreeConfig as Mock).mockReturnValue({ documentTypes: { Page: { getQuery: {} } } });
        (usePageTreeContext as Mock).mockReturnValue({ currentCategory: "mainNavigation" });

        const { result } = renderHook(() => useCopyPastePages());
        const clipboard = await result.current.prepareForClipboard([page("a", null), page("aa", "a"), page("ab", "a"), page("b", null)]);

        expect(clipboard.pages.map((page) => page.id)).toEqual(["a", "aa", "ab", "b"]);
    });
});
