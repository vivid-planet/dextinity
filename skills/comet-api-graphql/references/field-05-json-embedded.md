# Field Type: JSON / Embedded Objects

## JSON Properties (stored as JSON column)

### Input — object

```typescript
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

// Required object
@IsNotEmpty()
@ValidateNested()
@Type(() => AddressInput)
@Field(() => AddressInput)
address: AddressInput;

// Nullable object — use { nullable: true } WITHOUT defaultValue: null
@IsOptional()
@ValidateNested()
@Type(() => AddressInput)
@Field(() => AddressInput, { nullable: true })
address?: AddressInput;
```

### Input — array of objects

```typescript
// Array uses @ValidateNested() (NOT { each: true })
@IsArray()
@ValidateNested()
@Type(() => ContactInput)
@Field(() => [ContactInput], { defaultValue: [] })
contacts: ContactInput[];
```

Note: For arrays, use `@ValidateNested()` without `{ each: true }` — class-transformer handles the array.

## Embedded Properties (@Embedded)

Treated the same as JSON objects in the input. The embedded class itself is used as both input and output type if it has `@InputType()` and `@ObjectType()` decorators.

```typescript
@IsNotEmpty()
@ValidateNested()
@Type(() => ScopeInput)
@Field(() => ScopeInput)
scope: ScopeInput;
```

## Filter / Sort

JSON and embedded fields are generally **NOT included** in filter or sort unless they have simple scalar sub-fields that are explicitly mapped.

## Resolver

JSON/embedded fields are plain objects — they can be spread directly in `assign()`:

```typescript
const entity = this.entityManager.create(Entity, {
    ...assignInput, // includes JSON fields directly
});
```

No special destructuring needed unless the field contains nested relations or blocks.
