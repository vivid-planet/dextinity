---
title: Setup
---

## API

The `UserPermissionsModule` uses async instantiation to allow injecting necessary services.

```ts
UserPermissionsModule.forRootAsync({
    useFactory: (userService: UserService, accessControlService: AccessControlService) => ({
        availableContentScopes: [ ... ],
        userService,
        accessControlService,
    }),
    inject: [UserService, AccessControlService],
    imports: [AuthModule],
}),
```

**Available Content Scopes**

The module needs all scopes available in the system. If this information can only be gathered in runtime, a callback can be used (please make sure to cache the return value as it will be requested at least once per request): `availableContentScopes?: ContentScope[] | (() => Promise<ContentScope[]> | ContentScope[]);`

:::note
If you handle a huge amount (thousands) of content scopes you might want **not** to define this scope part in `getContentScopesForUser`. Instead, you can check the scopes manually by overriding `isAllowed`. A a side-effect, these scopes will not be available in the admin panel.
:::

**User Service**

The User Permissions system does not provide users by itself, so you need to provide a UserService which implements the `UserPermissionsUserServiceInterface`:

```ts
class UserService implements UserPermissionsUserServiceInterface {
    getUser: (id: string) => Promise<User> | User;
    findUsers: (args: FindUsersArgs) => Promise<Users> | Users;
    createUserFromRequest?: (request: Request, idToken: JwtPayload) => Promise<User> | User;
}
```

While `getUser` and `findUsers` are self-explaining, `createUserFromRequest` needs some context about the authorization strategies provided by NestJS. Dextinity provides a custom strategy that expects a signed JWT in the Authorization Header. When using `createAuthProxyJwtStrategy`, the current user has to be loaded from the information of the submitted JWT. By default the `getUser` method is called, however, by providing `createUserFromRequest` a custom implementation is possible.

:::info
There may exist ready-to-use UserService-libraries that support the identity provider of your choice.
:::

**Access Control Service**

The Access Control Service should extend `AbstractAccessControlService` to use the default implementation of `isAllowed`.

```ts
export interface AccessControlServiceInterface {
    isAllowed(
        user: CurrentUser | SystemUser,
        permission: Permission,
        contentScope?: ContentScope,
    ): boolean;
    getPermissionsForUser?: (user: User) => Promise<PermissionsForUser> | PermissionsForUser;
    getContentScopesForUser?: (user: User) => Promise<ContentScopesForUser> | ContentScopesForUser;
}
```

Furthermore, the Access Control Service may provide two methods that allow to programmatically assign permissions and scopes to certain users. These assignments are handled throughout the system in the same way as manually assigned permissions and/or scopes. Moreover, they are also reflected in the admin panel.

It's also possible to add additional properties and meta information to permissions (`validFrom`, `validTo`, `reason`, `requestedBy`, `approvedBy`). Additionally, for admin users, Dextinity also provides the constants `UserPermissions.allPermissions` and `UserPermissions.allContentScopes`.

:::note
`getContentScopesForUser` returns the general scopes for the user but can be overridden for each permission in `getPermissionsForUser`. Please refer to the types that the IDE offers.
:::

## Admin

Add the `UserPermissionsPage` component. Currently, it's not possible to customize the admin panel.

:::info
Future version will support customization features like

- Show additional information about the user
- Allow injecting formatted names for permissions and scopes

:::
