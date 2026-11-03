---
"@dextinity/site-react": minor
"@dextinity/site-nextjs": minor
---

Allow rendering `PreviewSkeleton` as a server component

`PreviewSkeleton` is no longer a client component. When `hasContent` is `true`, it renders its children directly, so no client reference carrying `title` and `children` is added to the RSC payload. The placeholder shown for empty content is still rendered on the client, and its behavior in the block and site preview is unchanged.
