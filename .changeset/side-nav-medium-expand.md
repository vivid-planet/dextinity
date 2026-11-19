---
"@dextinity/ui": minor
---

Let people expand the collapsed navigation of `AppShell` on medium windows

From 768px to 1280px, the navigation still starts collapsed to icons, but its expand button and ⌘\ / Ctrl+\ now expand it. It lies over the content instead of pushing it aside, and collapses again when a page is picked, on Escape, or on a press outside it. On wide windows, `navCollapsed` and `onNavCollapsedChange` keep working as before.
