---
"@dextinity/ui": minor
---

Double the horizontal padding of medium buttons in the `dextinity` brand

The new brand token `--dextinity-brand-button-padding-factor` scales the horizontal padding of medium `Button`s. It's `2` in the `dextinity` brand and `1` in the `ai-hub` brand. Small buttons keep their padding.

A custom brand inherits `2` from the `dextinity` brand. To keep the previous padding, set the token in your brand:

```css
[data-dextinity-brand="acme"] {
    --dextinity-brand-button-padding-factor: 1;
}
```
