import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PixelImageBlockData } from "../../../blocks.generated.js";
import { type Config, ConfigProvider } from "../../../config/ConfigProvider.js";
import { createTheme } from "../../../theme/createTheme.js";
import { ThemeProvider } from "../../../theme/ThemeProvider.js";
import { usePixelImageBlockData } from "../usePixelImageBlockData.js";

interface CaptureOptions {
    data: PixelImageBlockData;
    defaultRenderWidth: number;
    largestPossibleRenderWidth?: number;
    aspectRatio?: number | string;
    config: Config;
}

function captureUsePixelImageData({ data, defaultRenderWidth, largestPossibleRenderWidth, aspectRatio, config }: CaptureOptions) {
    const captured: { value: ReturnType<typeof usePixelImageBlockData> | undefined } = { value: undefined };

    function Probe() {
        captured.value = usePixelImageBlockData({ data, defaultRenderWidth, largestPossibleRenderWidth, aspectRatio });
        return null;
    }

    renderToStaticMarkup(
        <ThemeProvider theme={createTheme()}>
            <ConfigProvider config={config}>
                <Probe />
            </ConfigProvider>
        </ThemeProvider>,
    );

    if (captured.value === undefined) {
        throw new Error("Probe did not run");
    }
    return captured.value;
}

function expectNonNull<T>(value: T | null): T {
    if (value === null) {
        throw new Error("Expected non-null result from usePixelImageBlockData");
    }
    return value;
}

const validSizes = [320, 640, 1280, 2048];
const baseUrl = "http://localhost:3000";
const config: Config = { pixelImageBlock: { validSizes, baseUrl } };

const smartUrlTemplate = "/dam/images/abc/resize:$resizeWidth:$resizeHeight/photo.jpg";

const smartImageData: PixelImageBlockData = {
    damFile: {
        id: "id-1",
        name: "photo.jpg",
        size: 1000,
        mimetype: "image/jpeg",
        contentHash: "hash",
        archived: false,
        fileUrl: "/dam/files/id-1.jpg",
        image: {
            width: 4000,
            height: 2000,
            cropArea: { focalPoint: "SMART" },
        },
    },
    urlTemplate: smartUrlTemplate,
};

describe("usePixelImageBlockData — width selection", () => {
    it("picks the smallest validSizes entry >= defaultRenderWidth × 2", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, config }));
        expect(result.imageUrl).toContain(":640:");
    });

    it("picks an exact validSizes match when present", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 320, config }));
        expect(result.imageUrl).toContain(":640:");
    });

    it("falls back to the largest validSizes entry when none qualifies", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 2000, config }));
        expect(result.imageUrl).toContain(":2048:");
    });

    it("uses largestPossibleRenderWidth × 2 when defaultRenderWidth equals largestPossibleRenderWidth", () => {
        const result = expectNonNull(
            captureUsePixelImageData({
                data: smartImageData,
                defaultRenderWidth: 600,
                largestPossibleRenderWidth: 600,
                config,
            }),
        );
        expect(result.imageUrl).toContain(":1200:");
    });

    it("defaults largestPossibleRenderWidth to theme.sizes.bodyWidth (600) and triggers DPR-2 fixed path at width 600", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 600, config }));
        expect(result.imageUrl).toContain(":1200:");
    });
});

describe("usePixelImageBlockData — URL prefixing", () => {
    it("prefixes a relative URL with config.pixelImageBlock.baseUrl", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, config }));
        expect(result.imageUrl.startsWith(`${baseUrl}/dam/images/abc/`)).toBe(true);
    });

    it("does not prefix an absolute URL", () => {
        const absoluteData: PixelImageBlockData = {
            ...smartImageData,
            urlTemplate: "https://cdn.example.com/$resizeWidth/$resizeHeight/photo.jpg",
        };
        const result = expectNonNull(captureUsePixelImageData({ data: absoluteData, defaultRenderWidth: 200, config }));
        expect(result.imageUrl.startsWith("https://cdn.example.com/")).toBe(true);
        expect(result.imageUrl.includes(baseUrl)).toBe(false);
    });
});

describe("usePixelImageBlockData — aspect ratio", () => {
    it("uses the natural image aspect ratio for SMART crop areas", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, config }));
        expect(result.desktopImageHeight).toBe(100);
        expect(result.imageUrl).toContain(":640:320/");
    });

    it("derives aspect ratio from crop dimensions for non-SMART crop areas", () => {
        const nonSmartData: PixelImageBlockData = {
            damFile: {
                id: "id-2",
                name: "photo2.jpg",
                size: 1000,
                mimetype: "image/jpeg",
                contentHash: "hash",
                archived: false,
                fileUrl: "/dam/files/id-2.jpg",
                image: {
                    width: 4000,
                    height: 2000,
                    cropArea: { focalPoint: "CENTER", width: 50, height: 100, x: 25, y: 0 },
                },
            },
            urlTemplate: smartUrlTemplate,
        };
        const result = expectNonNull(captureUsePixelImageData({ data: nonSmartData, defaultRenderWidth: 200, config }));
        expect(result.desktopImageHeight).toBe(200);
        expect(result.imageUrl).toContain(":640:640/");
    });

    it("throws when crop dimensions are missing on a non-SMART crop area", () => {
        const malformedData: PixelImageBlockData = {
            damFile: {
                id: "id-3",
                name: "photo3.jpg",
                size: 1000,
                mimetype: "image/jpeg",
                contentHash: "hash",
                archived: false,
                fileUrl: "/dam/files/id-3.jpg",
                image: {
                    width: 4000,
                    height: 2000,
                    cropArea: { focalPoint: "CENTER" },
                },
            },
            urlTemplate: smartUrlTemplate,
        };
        expect(() => captureUsePixelImageData({ data: malformedData, defaultRenderWidth: 200, config })).toThrow(/Missing crop dimensions/);
    });
});

describe("usePixelImageBlockData — aspectRatio override", () => {
    it("uses a numeric aspectRatio in place of the cropArea-derived ratio", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, aspectRatio: 16 / 9, config }));
        expect(result.imageUrl).toContain(":640:360/");
        expect(result.desktopImageHeight).toBe(113);
    });

    it.each([
        ["WxH", "16x9"],
        ["W:H", "16:9"],
        ["W/H", "16/9"],
    ])("parses string aspectRatio in %s form", (_label, value) => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, aspectRatio: value, config }));
        expect(result.imageUrl).toContain(":640:360/");
        expect(result.desktopImageHeight).toBe(113);
    });

    it("treats a single-token string as `width / 1`", () => {
        const result = expectNonNull(captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, aspectRatio: "2", config }));
        expect(result.imageUrl).toContain(":640:320/");
        expect(result.desktopImageHeight).toBe(100);
    });

    it("overrides a non-SMART cropArea ratio", () => {
        const nonSmartData: PixelImageBlockData = {
            damFile: {
                id: "id-override",
                name: "photo.jpg",
                size: 1000,
                mimetype: "image/jpeg",
                contentHash: "hash",
                archived: false,
                fileUrl: "/dam/files/id-override.jpg",
                image: {
                    width: 4000,
                    height: 2000,
                    cropArea: { focalPoint: "CENTER", width: 50, height: 100, x: 25, y: 0 },
                },
            },
            urlTemplate: smartUrlTemplate,
        };
        const result = expectNonNull(captureUsePixelImageData({ data: nonSmartData, defaultRenderWidth: 200, aspectRatio: "16x9", config }));
        expect(result.imageUrl).toContain(":640:360/");
        expect(result.desktopImageHeight).toBe(113);
    });

    it("throws when the aspectRatio string is malformed", () => {
        expect(() => captureUsePixelImageData({ data: smartImageData, defaultRenderWidth: 200, aspectRatio: "not-a-ratio", config })).toThrow(
            /An error occurred while parsing the aspect ratio: not-a-ratio/,
        );
    });
});

describe("usePixelImageBlockData — incomplete data", () => {
    it("returns null when damFile is absent", () => {
        const result = captureUsePixelImageData({ data: { urlTemplate: smartUrlTemplate }, defaultRenderWidth: 200, config });
        expect(result).toBeNull();
    });

    it("returns null when damFile.image is absent", () => {
        const noImageData: PixelImageBlockData = {
            damFile: {
                id: "id-4",
                name: "no-image.jpg",
                size: 0,
                mimetype: "image/jpeg",
                contentHash: "hash",
                archived: false,
                fileUrl: "/dam/files/id-4.jpg",
            },
            urlTemplate: smartUrlTemplate,
        };
        const result = captureUsePixelImageData({ data: noImageData, defaultRenderWidth: 200, config });
        expect(result).toBeNull();
    });
});
