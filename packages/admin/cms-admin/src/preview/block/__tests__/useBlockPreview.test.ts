import { act, renderHook } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { useBlockPreview } from "../useBlockPreview";

describe("useBlockPreview", () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it("reads a device stored by earlier versions and stores the new name on change", () => {
        window.localStorage.setItem("previewDevice", "1");
        const { result } = renderHook(() => useBlockPreview());

        expect(result.current.device).toBe("mobile");

        act(() => result.current.setDevice((device) => (device === "mobile" ? "tablet" : "desktop")));

        expect(result.current.device).toBe("tablet");
        expect(window.localStorage.getItem("previewDevice")).toBe('"tablet"');
    });
});
