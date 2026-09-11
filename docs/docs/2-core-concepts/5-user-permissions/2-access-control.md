---
title: Access Control in the API
---

:::note

The term **operation** stands for the locations in which Dextinity invokes permission checks:

- Queries/Mutations in GraphQL-resolvers
- Routes in REST-controllers

Normally you want to decorate the methods of these classes, however, decorating the whole class is also possible.
:::

After activating the module, Dextinity checks every operation for the required permissions and scopes. Therefore it is necessary to decorate the operations to let the system know what to check. Dextinity then checks if the current user possesses the permission defined in the decorator.

Additionally, the scope of the data in operation will be checked against the scope of the users. To achieve this, the system has to know the scope of the data that is being handled right now.

:::note
You might also want to check the permissions on field resolvers. To do that, you have to add `guards` to `fieldResolverEnhancers` in the configuration of the GraphQL-module. Please be aware that field resolvers are only checked for permissions but not for scopes.
:::

## Permission check

**@RequiredPermission**

This decorator is mandatory for all operations. The first parameter of type `string | string[] | "disablePermissionCheck"` configures which permission is necessary to access the decorated operation.

The core of Dextinity already defines a list of permissions (e.g. `pageTree`, `dam`, `cronJobs`, `userPermissions`). Permissions are defined as plain strings, in the most basic case they represent the main items of the menu bar in the admin panel.

However, if you need a more fine-grained access control you might want to concatenate strings, e.g. `newsRead` or `newsCreate`. Only create as many permissions as really necessary.

:::info
Future version will support a dot-like notation (e.g. `news` will subsume `news.read` and `news.write`).
:::

## Scope check

The scope check needs to know which scope is used for the current operation. This is described in [Evaluate Content Scopes documentation](/docs/core-concepts/content-scope/evaluate-content-scopes).

:::caution
Dextinity validates the data relevant for the operation, but cannot check if the validated data is finally used. You are responsible for applying the validated data in your operations.
:::

## Disable permission/scope checks

**skipScopeCheck**

The scope check can be disabled by adding `{skipScopeCheck: true}` as the second argument of the `@RequiredPermission` decorator.

:::caution
Use this option only when you are sure that checking the scope is not necessary (e.g. the current entity does not have a scope). Do not add it just because it seems cumbersome at the moment to add the correct `AffectedEntity`/`ScopedEntity` decorators.
:::

:::note
Also, try to avoid using the `@GetCurrentUser` decorator (which often leads to use `skipScopeCheck`). Instead, you should explicitly send all the data needed in an operation. In the following example, this requires adding `userId` as a scope part as well as passing the data throughout the client. In general, this leads to a cleaner API design.

```diff
- @RequiredPermission("products", {skipScopeCheck: true})
+ @RequiredPermission("products")
+ @AffectedEntity(User, { idArg: "userId" })
- async myProducts(@GetCurrentUser() currentUser: CurrentUser): Promise<Product[]> {
+ async productsForUser(@Args("userId", { type: () => ID }) userId: string): Promise<Product[]> {
      //...
  }
```

:::

### @DisableDextinityGuards

`@DisableDextinityGuards()` disables the global auth guards (`DextinityAuthGuard`, `UserPermissionsGuard`). This may be used if a different authentication method is desired (e.g., basic authentication) for a specific handler or class in combination with a custom guard.

e.g.:

```typescript
@DisableDextinityGuards()
@UseGuards(MyCustomGuard)
async handlerThatUsesACustomGuard(): {
    ...
}
```
