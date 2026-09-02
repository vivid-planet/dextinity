# @comet/api-generator

## 8.31.0

### Patch Changes

- Updated dependencies [8b5f06f]
- Updated dependencies [f3907cc]
    - @comet/cms-api@8.31.0

## 8.30.1

### Patch Changes

- Updated dependencies [ab940c1]
    - @comet/cms-api@8.30.1

## 8.30.0

### Patch Changes

- @comet/cms-api@8.30.0

## 8.29.0

### Patch Changes

- @comet/cms-api@8.29.0

## 8.28.2

### Patch Changes

- Updated dependencies [e58d3cb]
    - @comet/cms-api@8.28.2

## 8.28.1

### Patch Changes

- @comet/cms-api@8.28.1

## 8.28.0

### Patch Changes

- Updated dependencies [17bdce0]
    - @comet/cms-api@8.28.0

## 8.27.1

### Patch Changes

- Updated dependencies [bd2cf67]
    - @comet/cms-api@8.27.1

## 8.27.0

### Patch Changes

- Updated dependencies [6d05adb]
    - @comet/cms-api@8.27.0

## 8.26.0

### Patch Changes

- Updated dependencies [7f8313b]
    - @comet/cms-api@8.26.0

## 8.25.1

### Patch Changes

- Updated dependencies [c0c2e4b]
    - @comet/cms-api@8.25.1

## 8.25.0

### Patch Changes

- Updated dependencies [ba2729a]
- Updated dependencies [c6a5235]
    - @comet/cms-api@8.25.0

## 8.24.5

### Patch Changes

- Updated dependencies [0fd8103]
    - @comet/cms-api@8.24.5

## 8.24.4

### Patch Changes

- Updated dependencies [578525c]
    - @comet/cms-api@8.24.4

## 8.24.3

### Patch Changes

- @comet/cms-api@8.24.3

## 8.24.2

### Patch Changes

- @comet/cms-api@8.24.2

## 8.24.1

### Patch Changes

- Updated dependencies [cfe1979]
    - @comet/cms-api@8.24.1

## 8.24.0

### Patch Changes

- Updated dependencies [0653a34]
    - @comet/cms-api@8.24.0

## 8.23.4

### Patch Changes

- Updated dependencies [8651f82]
    - @comet/cms-api@8.23.4

## 8.23.3

### Patch Changes

- Updated dependencies [2b7c16f]
    - @comet/cms-api@8.23.3

## 8.23.2

### Patch Changes

- @comet/cms-api@8.23.2

## 8.23.1

### Patch Changes

- 56a5883: Fix missing import for nested `ManyToOne` resolver target entities

    `@comet/api-generator` now imports nested `ManyToOne` target entities in generated resolvers so generated code compiles without unresolved symbol errors.

- Updated dependencies [662eb98]
    - @comet/cms-api@8.23.1

## 8.23.0

### Patch Changes

- Updated dependencies [d8e7261]
    - @comet/cms-api@8.23.0

## 8.22.0

### Patch Changes

- e98ef39: Fix `MODULE_NOT_FOUND` errors caused by extensionless deep imports of `@nestjs/graphql` internals. `@nestjs/graphql` 13.3.0 tightened its `exports` map so that the `"./*": "./*"` pattern no longer maps to `.js` automatically. All deep imports of `@nestjs/graphql` internals now use explicit `.js` extensions.
    - @comet/cms-api@8.22.0

## 8.21.1

### Patch Changes

- Updated dependencies [2e2362a]
    - @comet/cms-api@8.21.1

## 8.21.0

### Patch Changes

- Updated dependencies [2491e24]
    - @comet/cms-api@8.21.0

## 8.20.4

### Patch Changes

- Updated dependencies [1e140d6]
    - @comet/cms-api@8.20.4

## 8.20.3

### Patch Changes

- @comet/cms-api@8.20.3

## 8.20.2

### Patch Changes

- Updated dependencies [016adfb]
    - @comet/cms-api@8.20.2

## 8.20.1

### Patch Changes

- Updated dependencies [78597e3]
    - @comet/cms-api@8.20.1

## 8.20.0

### Patch Changes

- Updated dependencies [ed00704]
    - @comet/cms-api@8.20.0

## 8.19.0

### Patch Changes

- 4bb3d09: Fix Prettier formatting in monorepo setups by using the Prettier API directly instead of the CLI
- Updated dependencies [0eb28a7]
    - @comet/cms-api@8.19.0

## 8.18.0

### Patch Changes

- Updated dependencies [64b70bc]
- Updated dependencies [e9c54bc]
- Updated dependencies [ef98821]
- Updated dependencies [b3bfe86]
    - @comet/cms-api@8.18.0

## 8.17.1

### Patch Changes

- Updated dependencies [91e9a8f]
    - @comet/cms-api@8.17.1

## 8.17.0

### Patch Changes

- @comet/cms-api@8.17.0

## 8.16.0

### Minor Changes

- 9ce5bb4: Add optional paging. It is now possible to create a non-paginated list query using @CrudGenerator paging=false option. Use with care.

### Patch Changes

- @comet/cms-api@8.16.0

## 8.15.0

### Minor Changes

- cc96333: Add support for custom error responses in update and create mutation and show it in form as submission error
- 0b266f4: Add support for hooksService that allows injecting a custom service into update/create mutation for custom validation logic

    Usage example:

    ```
    export class ProductService implements CrudGeneratorHooksService {
        async validateCreateInput(input: ProductInput, options: { currentUser: CurrentUser, scope: Scope, args: { department: string } }): Promise<void> {
            //add custom validation logic here
        }
        async validateUpdateInput(input: ProductInput, options: { currentUser: CurrentUser, entity: Product }): Promise<void> {
            //add custom validation logic here
        }
    }

    @CrudGenerator({ .... hooksService: ProductService })
    class Products ...
    ```

### Patch Changes

- @comet/cms-api@8.15.0

## 8.14.0

### Patch Changes

- Updated dependencies [736e4ae]
    - @comet/cms-api@8.14.0

## 8.13.0

### Patch Changes

- 5e8a5c5: Fix resolver and DTO for nested OneToMany relations
- Updated dependencies [6b0b088]
- Updated dependencies [05638ed]
    - @comet/cms-api@8.13.0

## 8.12.0

### Patch Changes

- Updated dependencies [488da0b]
- Updated dependencies [2930556]
    - @comet/cms-api@8.12.0

## 8.11.1

### Patch Changes

- 0839bd6: Fix accidentally formatting all files
    - @comet/cms-api@8.11.1

## 8.11.0

### Minor Changes

- 4bb9e21: Format generated files using prettier
- 09e677f: Add support for soft delete by setting deletedAt in delete mutation

    Note: The filter to exclude deleted entries by default has to be added manually to the entity, api-generator can't do that.

### Patch Changes

- 8f8eea7: Fix duplicate class-validator imports in generated input file
- aec3ec2: Skip props with Unsupported Reference Type instead of generating broken input
- Updated dependencies [f34b750]
    - @comet/cms-api@8.11.0

## 8.10.0

### Patch Changes

- Updated dependencies [5f025a9]
    - @comet/cms-api@8.10.0

## 8.9.0

### Patch Changes

- 1231050: Fix id default value for sort if sort is disabled
- 0839ae8: Fix generated sort DTO to avoid duplicate `id` field
- Updated dependencies [ef30d93]
- Updated dependencies [5cf497f]
    - @comet/cms-api@8.9.0

## 8.8.0

### Minor Changes

- e16e1f9: list query: add default value for sort if there is a position column
- 6898b95: Add default sort order: position (if exists), createdAt (if exists), id

### Patch Changes

- Updated dependencies [d328dac]
- Updated dependencies [e62d6bd]
- Updated dependencies [b79687c]
    - @comet/cms-api@8.8.0

## 8.7.1

### Patch Changes

- Updated dependencies [9ed0711]
- Updated dependencies [182c930]
- Updated dependencies [07c9b17]
    - @comet/cms-api@8.7.1

## 8.7.0

### Patch Changes

- 8d61ce6: Support type=integer, not just columnType=integer
- ec40bb1: Support input for relations with text as primary key
- Updated dependencies [b2da6c9]
- Updated dependencies [13babd1]
- Updated dependencies [b305d5b]
    - @comet/cms-api@8.7.0

## 8.6.0

### Patch Changes

- e81b1ef: Cleanup dependencies
    - Make `@mikro-orm/core` and `@mikro-orm/postgresql` peer dependencies
    - Make `typescript` a dependency
    - Exclude `test-helper.ts` from build and leave `prettier` as dev dependency

    This shouldn't have any noticeable effect.

- Updated dependencies [206b352]
- Updated dependencies [fda9262]
- Updated dependencies [30b671e]
- Updated dependencies [fbae3ae]
- Updated dependencies [6326641]
    - @comet/cms-api@8.6.0

## 8.5.2

### Patch Changes

- dd351bf: Fix import path for relations targeting entity from `@comet/cms-api`
    - @comet/cms-api@8.5.2

## 8.5.1

### Patch Changes

- f292b68: Fix position update when trying to move entry to position higher than total item count
    - @comet/cms-api@8.5.1

## 8.5.0

### Patch Changes

- Updated dependencies [942200f]
- Updated dependencies [b7156bb]
    - @comet/cms-api@8.5.0

## 8.4.2

### Patch Changes

- @comet/cms-api@8.4.2

## 8.4.1

### Patch Changes

- @comet/cms-api@8.4.1

## 8.4.0

### Patch Changes

- f865dee: Fix generated query in position-service
- 2f73e74: Fix possibly duplicated imports in generated filter dto
- Updated dependencies [bdfb64f]
- Updated dependencies [8a6244e]
- Updated dependencies [c8f5d89]
    - @comet/cms-api@8.4.0

## 8.3.0

### Minor Changes

- 99950fa: Add support for sorting by ManyToOne and OneToOne relation fields

### Patch Changes

- 881827a: input-dto: generate import for typed (using type not class) json property
- Updated dependencies [613bc13]
- Updated dependencies [78b7703]
- Updated dependencies [4a9938a]
- Updated dependencies [99950fa]
    - @comet/cms-api@8.3.0

## 8.2.0

### Patch Changes

- Updated dependencies [049d5cd]
- Updated dependencies [5456186]
    - @comet/cms-api@8.2.0

## 8.1.1

### Patch Changes

- Updated dependencies [ef0f848]
- Updated dependencies [5b61069]
    - @comet/cms-api@8.1.1

## 8.1.0

### Patch Changes

- @comet/cms-api@8.1.0

## 8.0.0

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 8e193a3: Introduce a strongly-typed permission system using the new `Permission` GraphQL enum and `Permission` type, replacing previous string-based permissions.

    **Breaking changes**
    1. **Mandatory `requiredPermission`**: The `@CrudGenerator` decorator now requires the `requiredPermission` parameter to be explicitly specified
    2. **Permission Type Changes**: All permission-related APIs now expect typed permissions instead of plain strings

- 8ef9a56: Use `GraphQLLocalDate` instead of `GraphQLDate` for date-only columns

    The `GraphQLDate` scalar coerces strings (e.g., `2025-06-30`) to `Date` objects when used as an input type.
    This causes problems when used in combination with MikroORM v6, which treats date-only columns as strings.
    Since using strings is preferred, the `GraphQLLocalDate` scalar is used instead, which performs no type coercion.

    **How to upgrade**
    1. Use `string` instead of `Date` for date-only columns:

    ```diff
    class Product {
        @Property({ type: types.date, nullable: true })
        @Field(() => GraphQLDate, { nullable: true })
    -   availableSince?: Date = undefined;
    +   availableSince?: string = undefined;
    }
    ```

    2. Use `GraphQLLocalDate` instead of `GraphQLDate`:

    ```diff
    - import { GraphQLDate } from "graphql-scalars";
    + import { GraphQLLocalDate } from "graphql-scalars";

    class Product {
        @Property({ type: types.date, nullable: true })
    -   @Field(() => GraphQLDate, { nullable: true })
    +   @Field(() => GraphQLLocalDate, { nullable: true })
        availableSince?: string = undefined;
    }
    ```

    3. Add the `LocalDate` scalar to `codegen.ts`:

    ```diff
    scalars: rootBlocks.reduce(
        (scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }),
    +   { LocalDate: "string" }
    )
    ```

- 678bb0b: Move API Generator into separate `@comet/api-generator` package

    It can be run with the same `comet-api-generator` command as before.

- 28d572b: Remove special `status` field behavior

### Minor Changes

- 9cf2160: API Generator: Add new option `single` to `@CrudGenerator` which allows to enable/disable the single query
- 7e89a91: Add input support for custom mikro-orm types, the `@Field` type must also be an `@InputType`
- 3018f67: Always generate GraphQL input

    Generate the input even if `create` and `update` are both set to `false`.
    The input is still useful for other operations, e.g., a custom create mutation.

- 74c4fa7: Use the Entity Manager for all MikroORM operations
- 0328fa3: API Generator: Add support for filtering `ID` fields
- ce6d3cd: Add basic support for inheritance used by entities
- d8c62ef: Add watch (`--watch`) and single file (`--file`) modes

### Patch Changes

- 0ee3e04: Exit without an error code when no entities are found
- 4186bbb: Activate transpileOnly for better performance and fix enum issue we have with it
- e5b3b3d: Improve Performance: Don't format generated files with eslint anymore

    When scaffolding run eslint as first step.

- Updated dependencies [5cca3e1]
- Updated dependencies [9cf2160]
- Updated dependencies [04b8692]
- Updated dependencies [b8817b8]
- Updated dependencies [b3e73a5]
- Updated dependencies [ebf05cf]
- Updated dependencies [ef1c645]
- Updated dependencies [3562a94]
- Updated dependencies [b039dcb]
- Updated dependencies [26dd92a]
- Updated dependencies [abbe4af]
- Updated dependencies [b3e73a5]
- Updated dependencies [cbfa595]
- Updated dependencies [bc5f831]
- Updated dependencies [f904b71]
- Updated dependencies [56064fc]
- Updated dependencies [e8f4b07]
- Updated dependencies [412bbf2]
- Updated dependencies [cf1a829]
- Updated dependencies [8e193a3]
- Updated dependencies [0fa9b84]
- Updated dependencies [9cb98ee]
- Updated dependencies [7e97e18]
- Updated dependencies [44915b9]
- Updated dependencies [8ef9a56]
- Updated dependencies [23f393b]
- Updated dependencies [092e96e]
- Updated dependencies [a567f60]
- Updated dependencies [58a99bb]
- Updated dependencies [7e7a4aa]
- Updated dependencies [9c3f72e]
- Updated dependencies [1e39c70]
- Updated dependencies [0d210fe]
- Updated dependencies [c63817a]
- Updated dependencies [f20ec6c]
- Updated dependencies [0328fa3]
- Updated dependencies [e478c6b]
- Updated dependencies [4c48918]
- Updated dependencies [b4d1677]
- Updated dependencies [2a9f23d]
- Updated dependencies [678bb0b]
- Updated dependencies [8552e1b]
- Updated dependencies [52b0410]
- Updated dependencies [1450882]
- Updated dependencies [864e6de]
- Updated dependencies [c5de11c]
- Updated dependencies [b63ecc8]
    - @comet/cms-api@8.0.0

## 8.0.0-beta.6

### Patch Changes

- Updated dependencies [ef1c645]
- Updated dependencies [44915b9]
- Updated dependencies [c5de11c]
    - @comet/cms-api@8.0.0-beta.6

## 8.0.0-beta.5

### Minor Changes

- 9cf2160: API Generator: Add new option `single` to `@CrudGenerator` which allows to enable/disable the single query
- 7e89a91: Add input support for custom mikro-orm types, the `@Field` type must also be an `@InputType`
- 74c4fa7: Use the Entity Manager for all MikroORM operations
- ce6d3cd: Add basic support for inheritance used by entities
- d8c62ef: Add watch (`--watch`) and single file (`--file`) modes

### Patch Changes

- 4186bbb: Activate transpileOnly for better performance and fix enum issue we have with it
- e5b3b3d: Improve Performance: Don't format generated files with eslint anymore

    When scaffolding run eslint as first step.

- Updated dependencies [9cf2160]
- Updated dependencies [26dd92a]
- Updated dependencies [7e97e18]
- Updated dependencies [9c3f72e]
- Updated dependencies [c63817a]
- Updated dependencies [e478c6b]
- Updated dependencies [b63ecc8]
    - @comet/cms-api@8.0.0-beta.5

## 8.0.0-beta.4

### Major Changes

- 28d572b: Remove special `status` field behavior

### Minor Changes

- 0328fa3: API Generator: Add support for filtering `ID` fields

### Patch Changes

- Updated dependencies [b039dcb]
- Updated dependencies [412bbf2]
- Updated dependencies [0fa9b84]
- Updated dependencies [0328fa3]
    - @comet/cms-api@8.0.0-beta.4

## 8.0.0-beta.3

### Patch Changes

- @comet/cms-api@8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

### Patch Changes

- 0ee3e04: Exit without an error code when no entities are found
- Updated dependencies [f904b71]
- Updated dependencies [56064fc]
- Updated dependencies [23f393b]
- Updated dependencies [092e96e]
    - @comet/cms-api@8.0.0-beta.2

## 8.0.0-beta.1

### Patch Changes

- @comet/cms-api@8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 678bb0b: Move API Generator into separate `@comet/api-generator` package

    It can be run with the same `comet-api-generator` command as before.

### Patch Changes

- Updated dependencies [04b8692]
- Updated dependencies [b8817b8]
- Updated dependencies [3562a94]
- Updated dependencies [abbe4af]
- Updated dependencies [bc5f831]
- Updated dependencies [e8f4b07]
- Updated dependencies [cf1a829]
- Updated dependencies [9cb98ee]
- Updated dependencies [a567f60]
- Updated dependencies [58a99bb]
- Updated dependencies [7e7a4aa]
- Updated dependencies [0d210fe]
- Updated dependencies [f20ec6c]
- Updated dependencies [4c48918]
- Updated dependencies [678bb0b]
- Updated dependencies [8552e1b]
- Updated dependencies [52b0410]
    - @comet/cms-api@8.0.0-beta.0
