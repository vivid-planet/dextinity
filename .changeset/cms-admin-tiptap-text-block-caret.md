---
"@dextinity/cms-admin": patch
---

Keep the caret and the text when switching a TipTap line to another text type, and give the TipTap editor an accessible name

Switching a line to a text type that renders another element, e.g. a heading, swapped the element underneath the editor: the caret jumped to the start of the line, and End then Enter could lose the line's text. The editor is named "Rich text" by default; `TipTapEditor` takes a `label` for another name.
