---
"@dextinity/cms-api": patch
---

Match the last word as a prefix in `myFullTextSearch` and `pageTreeFullTextSearch`

Both queries only found whole words, so searching for `Navig` didn't find `Navigation`. The last word of the search is now matched as a prefix, so results appear while the user is still typing.
