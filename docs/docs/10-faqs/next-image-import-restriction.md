---
title: Why shouldn't I use next/image?
---

The [Next.js Image component](https://nextjs.org/docs/app/api-reference/components/image) optimizes and caches images in-memory by default.
This doesn't play well with our deployment setup for the following reasons:

- The cache is created per pod, which means we'll have to build the same cache for the number of site pods we have (at least two, possibly more due to autoscaling).
- The cache is lost when restarting a pod, which means we'll have to build the cache again after a deployment or autoscaling.
- Optimizing (e.g., resizing) images in the site requires lots of resources, both CPU and memory, thereby increasing the load on our site pods.

Instead of using `next/image`, choose one of the following options based on the image's origin:

1. For DAM images, use the `Image` component from `@dextinity/site-nextjs` instead, which uses the imgproxy to optimize images.
2. For local images (i.e., files in the `public/` folder), use a plain `<img>` tag instead.

    :::note

    Optimizing (e.g., resizing) local images isn't supported.

    :::

3. For external images (i.e., images served by a third party), use a plain `<img>` tag instead.
