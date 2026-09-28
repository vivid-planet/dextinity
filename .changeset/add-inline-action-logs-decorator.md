---
"@comet/cms-api": minor
---

Add `InlineActionLogs` decorator for action logs

Add an `@InlineActionLogs()` relation decorator to log changes to a one-to-many or many-to-many relation as part of the owning entity's action log instead of producing separate action log entries.

Use it for relations that are edited through the owning entity's form (e.g. assigned colors or tags). Adding, removing, or editing an item of an inline relation now creates a single action log entry on the owning entity, and the relation's items are included in that entry's snapshot. It is often combined with `orphanRemoval: true`, but that is not required.

**Example**

```ts
@ActionLogs()
@Entity()
export class Product {
    @OneToMany(() => ProductColor, (color) => color.product, { orphanRemoval: true })
    @InlineActionLogs()
    colors = new Collection<ProductColor>(this);
}
```
