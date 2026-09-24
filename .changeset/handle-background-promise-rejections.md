---
"@dextinity/cms-api": patch
---

Prevent the API from crashing when the dominant color calculation or the cleanup of outdated mail logs fails

Both run in the background without being awaited. A failure previously caused an unhandled promise rejection, which terminates the process by default. The error is now logged instead.
