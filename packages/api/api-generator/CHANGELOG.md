# @comet/api-generator

## 10.1.0

### Patch Changes

- @dextinity/cms-api@10.1.0

## 10.0.1

### Patch Changes

- @dextinity/cms-api@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/api-generator` to `@dextinity/api-generator`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `comet-api-generator` binary to `dextinity-api-generator`:

        ```diff
        - "generate-crud": "comet-api-generator"
        + "generate-crud": "dextinity-api-generator"
        ```

    - Change the header of generated files. Rerun the generator to update them

### Patch Changes

- Updated dependencies [86f90cb]
- Updated dependencies [f843a5e]
    - @dextinity/cms-api@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/api-generator` to `@dextinity/api-generator`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `comet-api-generator` binary to `dextinity-api-generator`:

        ```diff
        - "generate-crud": "comet-api-generator"
        + "generate-crud": "dextinity-api-generator"
        ```

    - Change the header of generated files. Rerun the generator to update them

### Patch Changes

- Updated dependencies [86f90cb]
- Updated dependencies [f843a5e]
- Updated dependencies [8c6be74]
    - @dextinity/cms-api@10.0.0-beta.0

## 9.5.0

### Patch Changes

- Updated dependencies [4eadaf5]
- Updated dependencies [4eadaf5]
    - @comet/cms-api@9.5.0

## 9.4.0

### Patch Changes

- Updated dependencies [0dac371]
- Updated dependencies [14d481e]
- Updated dependencies [8c6be74]
    - @comet/cms-api@9.4.0

## 9.3.0

### Patch Changes

- Updated dependencies [a8e8f02]
- Updated dependencies [924b66c]
    - @comet/cms-api@9.3.0

## 9.2.2

### Patch Changes

- Updated dependencies [d1022e2]
- Updated dependencies [a2515ce]
    - @comet/cms-api@9.2.2

## 9.2.1

### Patch Changes

- @comet/cms-api@9.2.1

## 9.2.0

### Patch Changes

- Updated dependencies [ee0bf93]
- Updated dependencies [3c28742]
- Updated dependencies [8d46a98]
    - @comet/cms-api@9.2.0

## 9.1.1

### Patch Changes

- @comet/cms-api@9.1.1

## 9.1.0

### Patch Changes

- Updated dependencies [319f5b8]
    - @comet/cms-api@9.1.0

## 9.0.1

### Patch Changes

- @comet/cms-api@9.0.1

## 9.0.0

### Major Changes

- 18748d1: Stop generating GraphQL selection-set based `populate` handling in generated CRUD list resolvers.

    MikroORM dataloader must now be enabled in API projects (for example with `dataloader: DataloaderType.ALL` in your MikroORM config) to efficiently resolve relation fields.

- 10dda8c: Remove `targetDirectory` config from `@CrudGenerator` decorator and always generate files to `${__dirname}/../generated/`

### Minor Changes

- 623111e: Support re-using an enum (for filters) in multiple models by using a shared generated filter type
- 70a77db: Reuse `@RequiredPermission` from entity in resolver permissions

    The `UserPermissionsGuard` now falls back to the entity's `@RequiredPermission` decorator when no permission is explicitly set on the resolver. The entity is resolved from the `@Resolver(() => Entity)` decorator.

    Additionally, the CRUD generator no longer emits `@RequiredPermission` on generated resolvers if the entity already has `@RequiredPermission` set. This avoids redundant permission declarations.

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- 8642996: Fix `MODULE_NOT_FOUND` errors caused by extensionless deep imports of `@nestjs/graphql` internals. `@nestjs/graphql` 13.3.0 tightened its `exports` map so that the `"./*": "./*"` pattern no longer maps to `.js` automatically. All deep imports of `@nestjs/graphql` internals now use explicit `.js` extensions.
- 16c0e64: Fix missing import for nested `ManyToOne` resolver target entities

    `@comet/api-generator` now imports nested `ManyToOne` target entities in generated resolvers so generated code compiles without unresolved symbol errors.

- Updated dependencies [f1a473a]
- Updated dependencies [8954d64]
- Updated dependencies [4c1aeb2]
- Updated dependencies [67938b2]
- Updated dependencies [c0cee12]
- Updated dependencies [7fbe2a7]
- Updated dependencies [54f57dd]
- Updated dependencies [a50793a]
- Updated dependencies [cac2b3b]
- Updated dependencies [9d5f045]
- Updated dependencies [c6703db]
- Updated dependencies [8c2fdde]
- Updated dependencies [b0ceb9c]
- Updated dependencies [127a492]
- Updated dependencies [fa5c7a4]
- Updated dependencies [f6a2932]
- Updated dependencies [35e9e0d]
- Updated dependencies [91f4a9f]
- Updated dependencies [6b7adc7]
- Updated dependencies [31d9296]
- Updated dependencies [19a0528]
- Updated dependencies [71dce06]
- Updated dependencies [1b37655]
- Updated dependencies [f162fa5]
- Updated dependencies [1ad7de3]
- Updated dependencies [0e7d7e9]
- Updated dependencies [3f3da52]
- Updated dependencies [affbb11]
- Updated dependencies [fad0167]
- Updated dependencies [6793853]
- Updated dependencies [a2c2eb5]
- Updated dependencies [962a320]
- Updated dependencies [802b0b8]
- Updated dependencies [8bf0e5b]
- Updated dependencies [70a77db]
- Updated dependencies [2ea835c]
- Updated dependencies [8498a7c]
- Updated dependencies [ac59b62]
- Updated dependencies [171c335]
- Updated dependencies [8ad9dd8]
- Updated dependencies [bc57b4a]
- Updated dependencies [2fe9d4b]
- Updated dependencies [dd51208]
- Updated dependencies [8722deb]
    - @comet/cms-api@9.0.0

## 9.0.0-beta.6

### Minor Changes

- 70a77db: Reuse `@RequiredPermission` from entity in resolver permissions

    The `UserPermissionsGuard` now falls back to the entity's `@RequiredPermission` decorator when no permission is explicitly set on the resolver. The entity is resolved from the `@Resolver(() => Entity)` decorator.

    Additionally, the CRUD generator no longer emits `@RequiredPermission` on generated resolvers if the entity already has `@RequiredPermission` set. This avoids redundant permission declarations.

### Patch Changes

- Updated dependencies [f1a473a]
- Updated dependencies [8954d64]
- Updated dependencies [4c1aeb2]
- Updated dependencies [67938b2]
- Updated dependencies [7fbe2a7]
- Updated dependencies [35e9e0d]
- Updated dependencies [91f4a9f]
- Updated dependencies [1b37655]
- Updated dependencies [affbb11]
- Updated dependencies [fad0167]
- Updated dependencies [6793853]
- Updated dependencies [70a77db]
- Updated dependencies [8498a7c]
- Updated dependencies [ac59b62]
    - @comet/cms-api@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [c0cee12]
- Updated dependencies [9d5f045]
- Updated dependencies [b0ceb9c]
- Updated dependencies [6b7adc7]
- Updated dependencies [a2c2eb5]
- Updated dependencies [8ad9dd8]
    - @comet/cms-api@9.0.0-beta.5

## 9.0.0-beta.4

### Patch Changes

- 16c0e64: Fix missing import for nested `ManyToOne` resolver target entities

    `@comet/api-generator` now imports nested `ManyToOne` target entities in generated resolvers so generated code compiles without unresolved symbol errors.

- Updated dependencies [c6703db]
- Updated dependencies [127a492]
- Updated dependencies [fa5c7a4]
- Updated dependencies [31d9296]
- Updated dependencies [2fe9d4b]
    - @comet/cms-api@9.0.0-beta.4

## 9.0.0-beta.3

### Minor Changes

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- 8642996: Fix `MODULE_NOT_FOUND` errors caused by extensionless deep imports of `@nestjs/graphql` internals. `@nestjs/graphql` 13.3.0 tightened its `exports` map so that the `"./*": "./*"` pattern no longer maps to `.js` automatically. All deep imports of `@nestjs/graphql` internals now use explicit `.js` extensions.
- Updated dependencies [a50793a]
- Updated dependencies [cac2b3b]
- Updated dependencies [f6a2932]
- Updated dependencies [71dce06]
- Updated dependencies [0e7d7e9]
- Updated dependencies [962a320]
- Updated dependencies [802b0b8]
- Updated dependencies [8bf0e5b]
- Updated dependencies [2ea835c]
- Updated dependencies [dd51208]
- Updated dependencies [8722deb]
    - @comet/cms-api@9.0.0-beta.3

## 9.0.0-beta.2

### Patch Changes

- Updated dependencies [1ad7de3]
    - @comet/cms-api@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [19a0528]
- Updated dependencies [f162fa5]
- Updated dependencies [3f3da52]
- Updated dependencies [171c335]
    - @comet/cms-api@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- 18748d1: Stop generating GraphQL selection-set based `populate` handling in generated CRUD list resolvers.

    MikroORM dataloader must now be enabled in API projects (for example with `dataloader: DataloaderType.ALL` in your MikroORM config) to efficiently resolve relation fields.

- 10dda8c: Remove `targetDirectory` config from `@CrudGenerator` decorator and always generate files to `${__dirname}/../generated/`

### Minor Changes

- 623111e: Support re-using an enum (for filters) in multiple models by using a shared generated filter type

### Patch Changes

- @comet/cms-api@9.0.0-beta.0

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
