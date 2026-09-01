import { describe, expect, it } from "vitest";

import { generateOutlookImageVml } from "../outlookVml.js";

const image = { src: "image.jpg", width: 400, height: 200 };

describe("generateOutlookImageVml", () => {
    it("measures arcsize against the shorter side, not the width", () => {
        const vml = generateOutlookImageVml({ ...image, borderRadius: 20 });

        expect(vml).toContain(`arcsize="20%"`);
    });

    it("caps arcsize at a fully rounded side", () => {
        const vml = generateOutlookImageVml({ ...image, borderRadius: 999 });

        expect(vml).toContain(`arcsize="100%"`);
    });

    it("draws an oval for a fully rounded radius", () => {
        const vml = generateOutlookImageVml({ ...image, borderRadius: "50%" });

        expect(vml).toContain("<v:oval ");
        expect(vml).not.toContain("arcsize");
    });

    it("skips the shape when the height is relative", () => {
        expect(generateOutlookImageVml({ ...image, height: "100%", borderRadius: 20 })).toBeNull();
    });

    it.each(["1em", "16px 4px", "0"])("skips the shape for a radius of %s", (borderRadius) => {
        expect(generateOutlookImageVml({ ...image, borderRadius })).toBeNull();
    });

    it("escapes quotes so a source URL cannot break out of its attribute", () => {
        const vml = generateOutlookImageVml({ ...image, src: `image.jpg" onerror="alert(1)`, borderRadius: 20 });

        expect(vml).toContain(`src="image.jpg&quot; onerror=&quot;alert(1)"`);
    });

    it.each(["alt", "href"])("builds the shape when %s is null", (attribute) => {
        const vml = generateOutlookImageVml({ ...image, borderRadius: 20, [attribute]: null });

        expect(vml).toContain("<v:roundrect ");
    });
});
