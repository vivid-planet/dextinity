---
"@dextinity/cms-admin": minor
---

Show the page of a DAM file and the DAM settings with `@dextinity/ui`

The file page (`<assets route>/<fileId>/edit`, linked as "All settings" in the finder) shows the preview on the left: the crop area and focus points of an image, the video with its captions, audio, or a PDF, the file's facts (format, size, dimensions, folder, upload and change date), and "Download" and "Replace". The tabs on the right hold the settings (name, crop and focus point, SEO texts with AI generation and translation, AI content disclosure, license), the embedded metadata of an image, the media alternatives (captions), duplicates, and dependents. Archive, restore, and delete are in the header's menu; saving shows its state next to the save button and works with Ctrl/⌘+S.

The license duration is a single date range field now. The DAM settings (`<assets route>/settings/settings`) choose the fallback image for invalid licenses with the `DamFileField`.
