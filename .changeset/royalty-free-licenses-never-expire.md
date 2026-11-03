---
"@dextinity/cms-api": minor
---

Never treat a royalty-free license as expired or not valid yet

Switching a file's license from rights managed to royalty free keeps its duration. Such a file was still blocked once the duration ended: the DAM answered `410 Gone`, blocks replaced it with the invalid-license fallback image, and the warnings reported an expired license.
A royalty-free license now ignores its duration: `isLicenseValid` returns `true`, `expirationDate` is `null`, and no license warning is created.
