---
"@dextinity/cms-api": minor
---

Return the highlighted search terms in the name (`titleHighlights`) and a `snippet` of the matching content for each result of `myFullTextSearch`

The snippets are built with the `onCreate`/`onUpdate` callbacks of the full-text property, so these callbacks must not have side effects.
