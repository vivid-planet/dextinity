---
title: Asset Management (DAM)
---

Dextinity has a built-in digital asset management interface (DAM). The DAM's purpose is the management of all files used on a website. That comprises media files (images, videos, audios), PDFs, zip-Files, and documents.

## Storage Backends

The DAM can be configured to use different storage backends. The following storage backends are supported:

- Local Filesystem
- Azure Storage
- S3 Compatible Storage

## Image Optimization

Images are optimized, cropped, and resized using [imgproxy](https://imgproxy.net/) to provide images optimized for different display sizes and to minimize data transfer. The resulting image is cached in the storage backend. The goal is to convert each image only once to reduce processing time.
