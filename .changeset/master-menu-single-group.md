---
"@dextinity/cms-admin": patch
---

Show the `MasterMenu` when all visible items are inside a single group

Previously, the menu counted only top-level entries to decide whether to render, so a group counted as a single entry regardless of how many items it contained. Users whose permitted pages were all inside one group got no navigation at all. The menu now counts the navigable items inside groups and collapsible items.
