---
"@comet/admin": patch
---

Remove passing required parameter in `CheckboxListField` to Checkbox component since it only adds the required star to all options, but without any functionality. Passing a validate function is required to actually define required on one or more checkbox options.
