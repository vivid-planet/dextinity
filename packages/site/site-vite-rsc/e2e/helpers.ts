export const publicCacheControl = "public, s-maxage=60";

export const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

export const requestTypes = [
    { name: "HTML request", prefix: "", contentType: "text/html;charset=utf-8" },
    { name: "RSC request", prefix: "/_rsc", contentType: "text/x-component;charset=utf-8" },
];
