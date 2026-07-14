import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { User } from "../user-permissions/interfaces/user";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { ActionLogsUser } from "./dto/action-logs-user";

@Injectable({ scope: Scope.REQUEST })
export class ActionLogsUserLoaderService {
    private dataLoader: DataLoader<string, ActionLogsUser>;

    constructor(private readonly userPermissionsService: UserPermissionsService) {
        this.dataLoader = new DataLoader<string, ActionLogsUser>(async (userIds) => {
            const idsToLookUp = userIds.filter((userId) => !this.userPermissionsService.isSystemUser(userId));
            const users = await this.userPermissionsService.findUsersByIds(idsToLookUp);
            const usersById = new Map<string, User>();
            for (const [index, userId] of idsToLookUp.entries()) {
                const user = users[index];
                if (user) {
                    usersById.set(userId, user);
                }
            }
            return userIds.map((userId) => {
                if (this.userPermissionsService.isSystemUser(userId)) {
                    return { id: userId, name: userId };
                }
                const user = usersById.get(userId);
                return user ? { id: user.id, name: user.name } : { id: userId };
            });
        });
    }

    load(userId: string): Promise<ActionLogsUser> {
        return this.dataLoader.load(userId);
    }
}
