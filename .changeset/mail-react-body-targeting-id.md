---
"@dextinity/mail-react": minor
---

Add `id="body"` to the `<body>` tag of every rendered mail

Some email clients replace the `<body>` tag with a `<div>`, so a `body` selector no longer reaches it. The id does.
