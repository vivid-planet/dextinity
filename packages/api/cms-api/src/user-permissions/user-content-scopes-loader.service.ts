import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { ContentScope } from "./interfaces/content-scope.interface";
import { User } from "./interfaces/user";
import { UserPermissionsService } from "./user-permissions.service";

@Injectable({ scope: Scope.REQUEST })
export class UserContentScopesLoaderService {
    private dataLoader: DataLoader<User, ContentScope[], string>;

    constructor(private readonly userPermissionsService: UserPermissionsService) {
        this.dataLoader = new DataLoader<User, ContentScope[], string>((users) => this.userPermissionsService.getContentScopesForUsers([...users]), {
            cacheKeyFn: (user) => user.id,
        });
    }

    load(user: User): Promise<ContentScope[]> {
        return this.dataLoader.load(user);
    }
}
