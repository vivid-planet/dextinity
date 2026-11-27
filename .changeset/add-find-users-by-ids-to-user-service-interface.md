---
"@dextinity/cms-api": minor
---

Add optional `findUsersByIds` to `UserPermissionsUserServiceInterface`

Implement it in the `UserService` you pass to `UserPermissionsModule` to look up several users with one call, for instance one request to the identity provider. Dextinity uses it where it resolves many users in one request, such as the users of the action log entries. Without it, Dextinity calls `findUser` once per user ID.

The returned users don't need to be in the order of the passed IDs, and missing users can be left out or returned as `null`.

**Example**

```ts
@Injectable()
export class UserService implements UserPermissionsUserServiceInterface {
    async findUsersByIds(ids: string[]): Promise<User[]> {
        return this.identityProvider.getUsers({ ids });
    }
    // ...
}
```
