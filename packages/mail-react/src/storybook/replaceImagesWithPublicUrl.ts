export function replaceImagesWithPublicUrl(html: string): string {
    const { html: htmlWithPublicImages, publicUrlByOriginalSrc } = replaceImageSources(html);

    return replaceOutlookVmlSources(htmlWithPublicImages, publicUrlByOriginalSrc);
}

function replaceImageSources(html: string): { html: string; publicUrlByOriginalSrc: Map<string, string> } {
    const publicUrlByOriginalSrc = new Map<string, string>();
    let seedCounter = 0;

    const htmlWithPublicImages = html.replace(/<img\b[^>]*>/gi, (imgTag) => {
        const widthMatch = imgTag.match(/\bwidth="(\d+)"/);
        const heightMatch = imgTag.match(/\bheight="(\d+)"/);

        if (widthMatch === null || heightMatch === null) {
            return imgTag;
        }

        const retinaWidth = parseInt(widthMatch[1], 10) * 2;
        const retinaHeight = parseInt(heightMatch[1], 10) * 2;
        const seed = seedCounter++;
        const publicUrl = `https://picsum.photos/seed/${seed}/${retinaWidth}/${retinaHeight}`;
        const srcMatch = imgTag.match(/\bsrc="([^"]*)"/);

        if (srcMatch) {
            publicUrlByOriginalSrc.set(srcMatch[1], publicUrl);
        }

        return imgTag.replace(/\bsrc="[^"]*"/, `src="${publicUrl}"`);
    });

    return { html: htmlWithPublicImages, publicUrlByOriginalSrc };
}

/** Classic Outlook draws the VML shape instead of the `<img>`, and the shape carries its own copy of the source. */
function replaceOutlookVmlSources(html: string, publicUrlByOriginalSrc: Map<string, string>): string {
    return html.replace(/<v:fill\b[^>]*>/gi, (fillTag) => {
        const srcMatch = fillTag.match(/\bsrc="([^"]*)"/);
        const publicUrl = srcMatch === null ? undefined : publicUrlByOriginalSrc.get(srcMatch[1]);

        return publicUrl === undefined ? fillTag : fillTag.replace(/\bsrc="[^"]*"/, `src="${publicUrl}"`);
    });
}
