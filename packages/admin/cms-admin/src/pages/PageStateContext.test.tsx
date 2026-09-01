import { type PropsWithChildren, useState } from "react";
import { act, renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { PageStateProvider, usePageState } from "./PageStateContext";

type TestPageState = { document: { seo: { htmlTitle: string } } };

function TestEditPage({ children }: PropsWithChildren) {
    const [pageState, setPageState] = useState<TestPageState | undefined>({ document: { seo: { htmlTitle: "Title from the api" } } });

    return (
        <PageStateProvider pageState={pageState} setPageState={setPageState}>
            {children}
        </PageStateProvider>
    );
}

describe("usePageState", () => {
    it("returns undefined outside of an edit page", () => {
        const { result } = renderHook(() => usePageState<TestPageState>());

        expect(result.current).toBeUndefined();
    });

    it("gives nested components read and write access to the page state", () => {
        const { result } = renderHook(() => usePageState<TestPageState>(), { wrapper: TestEditPage });

        expect(result.current?.pageState?.document.seo.htmlTitle).toBe("Title from the api");

        act(() => {
            result.current?.setPageState((pageState) => (pageState ? { document: { seo: { htmlTitle: "Title set by the AI mode" } } } : pageState));
        });

        expect(result.current?.pageState?.document.seo.htmlTitle).toBe("Title set by the AI mode");
    });
});
