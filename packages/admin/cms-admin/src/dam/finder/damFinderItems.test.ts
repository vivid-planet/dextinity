import { describe, expect, it } from "vitest";

import { getDamFinderQuickLookImageUrl } from "./damFinderItems";

const config = { apiUrl: "https://api.example.com", damBasePath: "dam" };

describe("getDamFinderQuickLookImageUrl", () => {
    it("scales a large image down while keeping its aspect ratio", () => {
        const url = getDamFinderQuickLookImageUrl({
            ...config,
            file: {
                id: "file-1",
                name: "large photo.jpg",
                mimetype: "image/jpeg",
                fileUrl: "https://api.example.com/original",
                image: { width: 6000, height: 4001 },
            },
        });

        expect(url).toBe("https://api.example.com/dam/images/preview/file-1/crop:100:100:NORTHWEST:0:0/resize:1920:1281/large%20photo");
    });

    it("shows the original of an image that is small enough", () => {
        const url = getDamFinderQuickLookImageUrl({
            ...config,
            file: {
                id: "file-1",
                name: "small.png",
                mimetype: "image/png",
                fileUrl: "https://api.example.com/original",
                image: { width: 1024, height: 1024 },
            },
        });

        expect(url).toBe("https://api.example.com/original");
    });

    it("shows the original of vector and animated images", () => {
        for (const mimetype of ["image/svg+xml", "image/gif"]) {
            const url = getDamFinderQuickLookImageUrl({
                ...config,
                file: { id: "file-1", name: "image", mimetype, fileUrl: "https://api.example.com/original", image: { width: 4000, height: 3000 } },
            });

            expect(url).toBe("https://api.example.com/original");
        }
    });
});
