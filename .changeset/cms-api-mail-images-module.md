---
"@dextinity/cms-api": minor
---

Add `MailImagesModule` to attach the images of a mail as inline attachments

Mail clients can't load an image whose URL isn't public, e.g. because the API is behind an auth proxy. `MailImagesService.renderWithImages` renders a mail with `rewriteImageSrc` of `@dextinity/mail-react`, which replaces the `src` of each image with a `cid:` reference, and returns the images as inline attachments. A DAM image is attached as the variant the image route serves, in the file's basic format; a relative `src` as a file from `staticFilesDirectory`.

```ts
MailImagesModule.register({ baseUrl: config.apiUrl, staticFilesDirectory: "public" });
```

```tsx
const { rendered, attachments } = await this.mailImagesService.renderWithImages({
    render: ({ rewriteImageSrc }) =>
        renderMailHtml(
            <MjmlMailRoot config={{ pixelImageBlock, rewriteImageSrc }}>
                <MailContent />
            </MjmlMailRoot>,
        ),
});
await this.mailerService.sendMail({ to, subject, html: rendered.html, attachments });
```
