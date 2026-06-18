import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { ActionLogsUser } from "./dto/action-logs-user";

@Injectable({ scope: Scope.REQUEST })
export class ActionLogsUserLoaderService {
    private dataLoader: DataLoader<string, ActionLogsUser>;

    constructor(private readonly userPermissionsService: UserPermissionsService) {
        this.dataLoader = new DataLoader<string, ActionLogsUser>(async (userIds) => {
            return Promise.all(
                userIds.map(async (userId) => {
                    if (this.userPermissionsService.isSystemUser(userId)) {
                        return { id: userId, name: userId };
                    }
                    const user = await this.userPermissionsService.findUser(userId);
                    return user ? { id: user.id, name: user.name } : { id: userId };
                }),
            );
        });
    }

    load(userId: string): Promise<ActionLogsUser> {
        return this.dataLoader.load(userId);
    }
}
