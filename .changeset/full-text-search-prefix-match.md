---
"@dextinity/cms-api": patch
---

Match word prefixes in `myFullTextSearch` and `pageTreeFullTextSearch`

Both queries only found whole words, so searching for `Navig` didn't find `Navigation`. Each word of the search is now matched as a prefix, so results appear while the user is still typing.
