/**
 * Counts the `<title>` elements in the `<head>` of the HTML stream, which passes through unchanged
 */
export function createTitleCountCheck(onTitleCount: (titleCount: number) => void) {
    const decoder = new TextDecoder();
    let head = "";
    let isHeadComplete = false;

    return new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            controller.enqueue(chunk);
            if (isHeadComplete) {
                return;
            }
            head += decoder.decode(chunk, { stream: true });
            const headEndIndex = head.indexOf("</head>");
            if (headEndIndex !== -1) {
                isHeadComplete = true;
                onTitleCount(head.slice(0, headEndIndex).match(/<title[\s>]/g)?.length ?? 0);
            }
        },
    });
}
