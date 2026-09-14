---
title: Validation
---

Dextinity provides custom validation decorators for use with [class-validator](https://github.com/typestack/class-validator) in NestJS DTOs.

## @IsUndefinable()

Use `@IsUndefinable()` to allow a field to be `undefined` while still validating it when a value is provided.

This is more specific than the `@IsOptional()` decorator from `class-validator`, which allows both `undefined` and `null`.

A typical use case is a small inline form that only updates a subset of an entity's fields (e.g., only the name). Fields not present in the form are omitted from the request body entirely (`undefined`) and should be left unchanged on the server.

```ts
import { IsUndefinable } from "@dextinity/cms-api";
import { IsString } from "class-validator";

class UpdateProductInput {
    @IsUndefinable()
    @IsString()
    name?: string;

    @IsUndefinable()
    @IsString()
    description?: string;
}
```

## @IsNullable()

Use `@IsNullable()` to allow a field to be `null` while still validating it when a value is provided.

This is more specific than the `@IsOptional()` decorator, which also allows `undefined`.

A typical use case is resetting or clearing an optional value (e.g., removing a product's assigned category).

```ts
import { IsNullable } from "@dextinity/cms-api";
import { IsString } from "class-validator";

class UpdateProductInput {
    @IsNullable()
    @IsString()
    category: string | null;
}
```

## Replacing @IsOptional()

The `@IsOptional()` decorator from `class-validator` allows both `undefined` and `null`. This can lead to unintentional bugs.

Use `@IsUndefinable()` or `@IsNullable()` to be more specific about which values are allowed:

| Decorator          | Allows `undefined` | Allows `null` |
| ------------------ | :----------------: | :-----------: |
| `@IsOptional()`    |         ✅         |      ✅       |
| `@IsUndefinable()` |         ✅         |      ❌       |
| `@IsNullable()`    |         ❌         |      ✅       |

## PartialType

Dextinity provides its own `PartialType` helper (from `@dextinity/cms-api`) that uses `@IsUndefinable()` instead of `@IsOptional()`.

When creating partial input types, use `PartialType` from `@dextinity/cms-api` instead of `@nestjs/mapped-types`:

```ts
import { PartialType } from "@dextinity/cms-api";

import { CreateProductInput } from "./create-product.input";

export class UpdateProductInput extends PartialType(CreateProductInput) {}
```

## DextinityValidationException

`DextinityValidationException` is the exception Dextinity raises when validation fails. It extends `DextinityException`, the base class for business-logic errors that should be reported back to the client as a `400 Bad Request` rather than logged as a server error. In addition to a message, it carries the list of `ValidationError`s produced by [class-validator](https://github.com/typestack/class-validator):

```ts
class DextinityValidationException extends DextinityException {
    constructor(
        message: string,
        readonly errors?: ValidationError[],
    );
}
```

### Automatic validation errors

DTO validation failures are turned into a `DextinityValidationException` by `ValidationExceptionFactory`. Wire it up as the `exceptionFactory` of a NestJS `ValidationPipe` so that every rejected DTO produces a `DextinityValidationException` instead of the default `BadRequestException`:

```ts
// main.ts
import { ExceptionFilter, ValidationExceptionFactory } from "@dextinity/cms-api";
import { ValidationPipe } from "@nestjs/common";

app.useGlobalFilters(new ExceptionFilter(config.debug));
app.useGlobalPipes(
    new ValidationPipe({
        exceptionFactory: ValidationExceptionFactory,
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
    }),
);
```

For dynamically typed args (for example a scope or an input whose type is only known at runtime), use `DynamicDtoValidationPipe` from `@dextinity/cms-api`, which is a `ValidationPipe` preconfigured with `ValidationExceptionFactory`.

### Throwing it manually

Throw a `DextinityValidationException` from a resolver or service for validation rules that can't be expressed with decorators — for example a uniqueness check that requires a database lookup:

```ts
import { DextinityValidationException } from "@dextinity/cms-api";

if (!(await this.redirectService.isRedirectSourceAvailable(input.source, scope))) {
    throw new DextinityValidationException("Validation failed");
}
```

### Error response

The `ExceptionFilter` catches every `DextinityException` and converts it into a `400 Bad Request`. For a `DextinityValidationException`, the collected `ValidationError`s are exposed under `validationErrors`:

```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "error": "DextinityValidationException",
    "validationErrors": [{ "property": "source" }]
}
```

The same shape is returned for both GraphQL and REST requests. Register the `ExceptionFilter` globally (see the `main.ts` example above) so these exceptions are translated consistently across the API.
