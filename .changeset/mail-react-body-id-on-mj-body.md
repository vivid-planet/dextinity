---
"@dextinity/mail-react": major
---

Set `id="body"` only in mails rendered with `MjmlMailRoot`

`MjmlMailRoot` sets the id on its `MjmlBody`, which MJML 5 supports, instead of `renderMailHtml` adding it to every rendered mail. Mails using `MjmlMailRoot` render the same HTML as before. If a mail renders its own `MjmlBody` and its CSS targets `#body`, set the id yourself:

```diff
- <MjmlBody>
+ <MjmlBody id="body">
```
