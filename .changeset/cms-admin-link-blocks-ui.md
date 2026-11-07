---
"@dextinity/cms-admin": major
---

Build the link blocks and the video URL fields with `@dextinity/ui`

The admin components of `createLinkBlock` (the link title), `InternalLinkBlock`, `ExternalLinkBlock`, `EmailLinkBlock`, `PhoneLinkBlock`, `AnchorBlock`, `createTextLinkBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` use the field adapters of `@dextinity/ui-react-final-form` instead of `Field` and `FinalFormInput` of `@dextinity/admin`, so they follow the design system, including the dark mode.

- `InternalLinkBlock` chooses the page with `PageTreeSelectField` and the anchor with a `SelectField`.
- "Open in new window" and "No follow" of `ExternalLinkBlock` are switches; the "No follow" explanation is the switch's description.
- The email and phone number fields don't offer the content translation anymore.
- The internal `FinalFormPageTreeSelect` is removed. Use `PageTreeSelectField` in forms built with `@dextinity/ui-react-final-form`.
- The redirect link blocks of `createRedirectsLinkBlock` show `Icon`s of `@dextinity/ui` instead of `@dextinity/admin-icons`.
