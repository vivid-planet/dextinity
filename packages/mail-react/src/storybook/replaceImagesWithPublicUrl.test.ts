import { describe, expect, it } from "vitest";

import { replaceImagesWithPublicUrl } from "./replaceImagesWithPublicUrl.js";

describe("replaceImagesWithPublicUrl", () => {
    it("replaces src with picsum URL using doubled dimensions", () => {
        const html = '<img src="original.jpg" width="300" height="200" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="https://picsum.photos/seed/0/600/400" width="300" height="200" />');
    });

    it("handles height before width", () => {
        const html = '<img src="original.jpg" height="200" width="300" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="https://picsum.photos/seed/0/600/400" height="200" width="300" />');
    });

    it("handles attributes before width and height", () => {
        const html = '<img alt="photo" src="original.jpg" width="100" height="50" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img alt="photo" src="https://picsum.photos/seed/0/200/100" width="100" height="50" />');
    });

    it("handles attributes between width and height", () => {
        const html = '<img src="original.jpg" width="100" alt="photo" height="50" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="https://picsum.photos/seed/0/200/100" width="100" alt="photo" height="50" />');
    });

    it("handles attributes after width and height", () => {
        const html = '<img src="original.jpg" width="100" height="50" alt="photo" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="https://picsum.photos/seed/0/200/100" width="100" height="50" alt="photo" />');
    });

    it("leaves img tags without width untouched", () => {
        const html = '<img src="original.jpg" height="200" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="original.jpg" height="200" />');
    });

    it("leaves img tags without height untouched", () => {
        const html = '<img src="original.jpg" width="300" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="original.jpg" width="300" />');
    });

    it("increments seed for each image", () => {
        const html = '<img src="a.jpg" width="100" height="100" /><img src="b.jpg" width="200" height="150" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe(
            '<img src="https://picsum.photos/seed/0/200/200" width="100" height="100" />' +
                '<img src="https://picsum.photos/seed/1/400/300" width="200" height="150" />',
        );
    });

    it("gives the VML shape the same public URL as its image", () => {
        const html =
            '<v:roundrect style="width:300px;height:200px;"><v:fill type="frame" src="original.jpg" /></v:roundrect>' +
            '<img src="original.jpg" width="300" height="200" />';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toContain('<v:fill type="frame" src="https://picsum.photos/seed/0/600/400" />');
        expect(result).toContain('<img src="https://picsum.photos/seed/0/600/400" width="300" height="200" />');
    });

    it("returns unchanged html when there are no img tags", () => {
        const html = "<p>Hello world</p>";
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe("<p>Hello world</p>");
    });

    it("handles non-self-closing img tags", () => {
        const html = '<img src="original.jpg" width="100" height="50">';
        const result = replaceImagesWithPublicUrl(html);

        expect(result).toBe('<img src="https://picsum.photos/seed/0/200/100" width="100" height="50">');
    });
});
