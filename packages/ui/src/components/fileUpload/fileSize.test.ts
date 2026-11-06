import { describe, expect, it } from "vitest";

import { formatFileSize } from "./fileSize";

describe("formatFileSize", () => {
    it("uses the largest unit that keeps the number at 1 or more", () => {
        expect(formatFileSize(512, "en")).toBe("512 B");
        expect(formatFileSize(1_400, "en")).toBe("1.4 kB");
        expect(formatFileSize(2_500_000, "en")).toBe("2.5 MB");
        expect(formatFileSize(3_000_000_000, "en")).toBe("3 GB");
    });
});
