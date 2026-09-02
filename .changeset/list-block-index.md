---
"@dextinity/site-react": minor
---

Pass the item index as second argument to `ListBlock`'s `block` function

This allows rendering list items based on their position, for instance, to stagger scroll-in animations.

**Example**

```tsx
<ListBlock
    data={data}
    block={(block, index) => (
        <AnimateBoxInOnScroll direction="bottom" delay={200 * index}>
            <KeyFactItemBlock data={block} />
        </AnimateBoxInOnScroll>
    )}
/>
```
