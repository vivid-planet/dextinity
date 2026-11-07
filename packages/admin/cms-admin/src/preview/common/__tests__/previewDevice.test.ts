import { describe, expect, it } from "vitest";

import { parsePreviewDevice } from "../previewDevice";

describe("parsePreviewDevice", () => {
    it("keeps a device name", () => {
        expect(parsePreviewDevice("tablet")).toBe("tablet");
    });

    it("migrates the index of the removed Device enum", () => {
        expect(parsePreviewDevice(0)).toBe("responsive");
        expect(parsePreviewDevice(1)).toBe("mobile");
        expect(parsePreviewDevice("2")).toBe("tablet");
        expect(parsePreviewDevice(3)).toBe("desktop");
    });

    it("falls back to the full width for unknown values", () => {
        expect(parsePreviewDevice(undefined)).toBe("responsive");
        expect(parsePreviewDevice("watch")).toBe("responsive");
        expect(parsePreviewDevice(7)).toBe("responsive");
    });
});
