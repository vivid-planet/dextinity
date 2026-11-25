import { http, HttpResponse } from "msw";

const placeholderImage = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#d9d9d9" />
    <circle cx="28" cy="28" r="8" fill="#a6a6a6" />
    <path d="M8 68 L32 40 L48 56 L56 48 L72 68 Z" fill="#a6a6a6" />
</svg>`;

export const damImagePreviewHandler = http.get("*/dam/images/preview/*", () => {
    return new HttpResponse(placeholderImage, { headers: { "Content-Type": "image/svg+xml" } });
});
