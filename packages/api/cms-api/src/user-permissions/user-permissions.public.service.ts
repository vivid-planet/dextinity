import { Injectable } from "@nestjs/common";

import type { User } from "./interfaces/user.js";
import { UserPermissionsService } from "./user-permissions.service.js";

@Injectable()
export class UserPermissionsPublicService {
    constructor(private readonly service: UserPermissionsService) {}

    async getAvailableContentScopes() {
        return this.service.getAvailableContentScopes();
    }

    async getAvailablePermissions() {
        return this.service.getAvailablePermissions();
    }

    async getPermissionsAndContentScopes(user: User) {
        return this.service.getPermissionsAndContentScopes(user);
    }
}
