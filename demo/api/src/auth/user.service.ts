import { FindUsersArgs, JwtPayload, JwtToUserServiceInterface, User, UserPermissionsUserServiceInterface, Users } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";

import { staticUsers } from "./static-users";

@Injectable()
export class UserService implements UserPermissionsUserServiceInterface, JwtToUserServiceInterface {
    convertJwtToUser(jwt: JwtPayload): User {
        if (!jwt.sub) {
            throw new Error("JWT does not contain sub");
        }
        return this.findUserOrThrow(jwt.sub);
    }
    findUser(id: string): User | null {
        const index = parseInt(id) - 1;
        return staticUsers[index] ?? null;
    }
    findUserOrThrow(id: string): User {
        const user = this.findUser(id);
        if (!user) {
            throw new Error(`User not found: ${id}`);
        }
        return user;
    }
    findUsers(args: FindUsersArgs): Users {
        const search = args.search?.toLowerCase();
        const users = staticUsers.filter((user) => !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));
        return [users.slice(args.offset, args.offset + args.limit), users.length];
    }
}
