import { describe, expect, it, vi } from "vitest";

import type { DamMailImageFetcherService } from "../dam-mail-image-fetcher.service";
import { type MailImagesRenderContext, MailImagesService } from "../mail-images.service";

const baseUrl = "http://api.example.com";
const urlTemplate = (id: string) => `/dam/images/hash/contenthash/${id}/crop:SMART/resize:$resizeWidth:$resizeHeight/photo`;
const imageUrl = (id: string) => `${baseUrl}${urlTemplate(id).replace("$resizeWidth:$resizeHeight", "640:320")}`;

function createService(fetchImage: DamMailImageFetcherService["fetchImage"]) {
    const damMailImageFetcher = { imagesPath: "/dam/images/", fetchImage } as unknown as DamMailImageFetcherService;
    return new MailImagesService({ baseUrl }, damMailImageFetcher);
}

function renderMail({ rewriteImageSrc, isImageFetched }: MailImagesRenderContext) {
    const images = ["a", "b"].map((id) =>
        isImageFetched({ urlTemplate: urlTemplate(id) }) ? rewriteImageSrc({ src: imageUrl(id) }) : "placeholder",
    );
    return { html: images.join(" ") };
}

describe("MailImagesService.renderWithImages", () => {
    it("renders once and attaches the images when all of them are fetched", async () => {
        const fetchImage = vi.fn(async () => ({ buffer: Buffer.from("image"), filename: "photo.jpg", contentType: "image/jpeg" }));
        const render = vi.fn(renderMail);

        const { rendered, attachments } = await createService(fetchImage).renderWithImages({ render });

        expect(render).toHaveBeenCalledTimes(1);
        expect(rendered.html).toBe(attachments.map(({ cid }) => `cid:${cid}`).join(" "));
    });

    it("renders again without an image that couldn't be fetched, taking the others from the first render", async () => {
        const fetchImage = vi.fn(async (path: string) =>
            path.includes("/a/") ? { buffer: Buffer.from("image"), filename: "photo.jpg", contentType: "image/jpeg" } : null,
        );

        const { rendered, attachments } = await createService(fetchImage).renderWithImages({ render: renderMail });

        expect(rendered.html).toBe(`cid:${attachments[0].cid} placeholder`);
        expect(attachments).toHaveLength(1);
        expect(fetchImage).toHaveBeenCalledTimes(2);
    });
});
