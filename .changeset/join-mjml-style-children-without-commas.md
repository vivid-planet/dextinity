---
"@dextinity/mail-react": patch
---

Stop joining the children of `MjmlStyle`, `MjmlComment`, `MjmlConditionalComment`, and `MjmlYahooStyle` with commas

With several children, for example a list of rules from `.map()` or text with expressions, these components put a comma between them.
In a stylesheet, the comma makes the next rule invalid, and mail clients ignore that rule without an error.

```tsx
<MjmlStyle>{[".a{color:red}", ".b{color:blue}"]}</MjmlStyle>
```

- Before: `<mj-style>.a{color:red},.b{color:blue}</mj-style>`
- After: `<mj-style>.a{color:red}.b{color:blue}</mj-style>`

```tsx
<MjmlComment>
    Built with {appName} at {buildDate}
</MjmlComment>
```

- Before: `<!--Built with ,Newsletter, at ,2026-11-04-->`
- After: `<!--Built with Newsletter at 2026-11-04-->`
