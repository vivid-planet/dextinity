import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AssetThumbnail } from "../AssetThumbnail";

afterEach(cleanup);

describe("AssetThumbnail", () => {
    it("emits type, ratio, and selection as data attributes, with their defaults when unset", () => {
        const { container } = render(
            <>
                <AssetThumbnail type="image" src="a.jpg" />
                <AssetThumbnail type="folder" ratio="1:1" selected />
            </>,
        );
        const [image, folder] = Array.from(container.children) as HTMLElement[];

        expect(image.className).toContain("dextinityAssetThumbnail");
        expect([image.dataset.type, image.dataset.ratio, image.hasAttribute("data-selected")]).toStrictEqual(["image", "4:3", false]);
        expect([folder.dataset.type, folder.dataset.ratio, folder.dataset.selected]).toStrictEqual(["folder", "1:1", ""]);
    });

    it("crops the picture around the focal point", () => {
        const { container } = render(<AssetThumbnail type="image" src="a.jpg" focalPoint={{ x: 0.25, y: 0.8 }} />);

        expect(container.querySelector("img")?.style.objectPosition).toBe("25% 80%");
    });

    it("renders the name and meta in the caption part", () => {
        const { container } = render(<AssetThumbnail type="image" src="a.jpg" name="a.jpg" meta="JPG" />);

        expect(container.querySelector(".dextinityAssetThumbnail__caption")?.textContent).toBe("a.jpgJPG");
    });
});
