import { expect, test } from "./browserTest";

test("renders the block that the admin sends through the IFrame bridge", async ({ page, goto }) => {
    await goto("/block-preview");
    await expect(page.locator("#block-preview")).toHaveText("Waiting for a block");

    await page.evaluate(() => {
        const block = {
            damFile: {
                id: "1",
                altText: "An image of the DAM",
                image: { width: 1600, height: 900, cropArea: { focalPoint: "SMART" }, dominantColor: "#ff0000" },
            },
            urlTemplate: "/dam/$resizeWidth/$resizeHeight/image.jpg",
        };
        window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block } }), "*");
    });

    await expect(page.locator("#block-preview img")).toHaveAttribute("alt", "An image of the DAM");
});
