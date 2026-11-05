const transparentPixel = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="),
    (character) => character.charCodeAt(0),
);

/**
 * The image proxy of the API, which resizes the images
 */
export function loader() {
    return new Response(transparentPixel, { headers: { "Content-Type": "image/png" } });
}
