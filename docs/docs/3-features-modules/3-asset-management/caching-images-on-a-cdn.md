---
title: Caching Images on a CDN
---

# Caching Images on a CDN

The API delivers a DAM image as WebP when the `Accept` header of the request offers it, and in the original format otherwise.
Originals that aren't JPEG, PNG or GIF are delivered as JPEG.
The response sends `Vary: Accept`, but CDNs such as Cloudflare and Bunny ignore this header by default and serve the format they cached first to every client.
A client that can't display WebP, such as classic Outlook for Windows, then shows a broken image.

Some CDNs can cache one variant per format, but only for URLs that end with an image file extension.
Enable `includeFormatExtensionInImageUrls` to add this extension to DAM image URLs:

```ts title="api/src/app.module.ts"
DamModule.register({
    damConfig: {
        // ...
        includeFormatExtensionInImageUrls: true,
    },
    // ...
});
```

The extension is the one of the format the API delivers without WebP in the `Accept` header, e.g. `photo.png` for a PNG and `scan.jpg` for a TIFF.
Image URLs with an outdated filename, i.e. without extension or from before the file was renamed, permanently redirect to the current URL, so pages rendered before enabling the option keep working.
The API accepts both URL forms regardless of the option, so you can disable it again without breaking URLs that are already in use.

## Cloudflare

Cloudflare's [Vary for Images](https://developers.cloudflare.com/cache/advanced-configuration/vary-for-images/) requires a Pro, Business or Enterprise plan.
Create the variants rule using the Cloudflare API:

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache/variants" \
    --request PATCH \
    --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    --json '{
        "value": {
            "jpg": ["image/webp"],
            "png": ["image/webp"],
            "gif": ["image/webp"]
        }
    }'
```

List only `image/webp`.
The API never delivers AVIF, and Cloudflare doesn't cache a response if the origin doesn't serve a variant configured in the rule.

## Bunny

Enable the **WebP support** option of the pull zone's [Vary Cache](https://bunny.net/docs/cdn/vary-cache) settings.
Bunny ignores the `Vary` header of the origin and uses this option instead.
It only applies to URLs with one of the extensions `jpg`, `jpeg`, `webp`, `png` and `gif`.
