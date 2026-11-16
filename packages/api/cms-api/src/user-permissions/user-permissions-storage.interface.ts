import type { CurrentUser } from "./dto/current-user.js";
import type { SystemUser } from "./user-permissions.types.js";

export interface UserPermissionsStorage {
    user: CurrentUser | SystemUser;
}
