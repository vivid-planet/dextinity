import { Field, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import type { ContentScope } from "../interfaces/content-scope.interface.js";
import { CombinedPermission, type Permission } from "../user-permissions.types.js";
import { UserPermissionsUser } from "./user.js";

@ObjectType()
export class CurrentUserPermission {
    @Field(() => CombinedPermission)
    permission: Permission;
    @Field(() => [GraphQLJSONObject])
    contentScopes: ContentScope[];
}

@ObjectType()
export class CurrentUser {
    @Field()
    id: string;
    @Field()
    name: string;
    @Field()
    email: string;
    @Field(() => [CurrentUserPermission])
    permissions: CurrentUserPermission[];
    @Field({ nullable: true })
    impersonated?: boolean;
    @Field(() => UserPermissionsUser, { nullable: true })
    authenticatedUser?: UserPermissionsUser;
    @Field({ nullable: true })
    accountUrl?: string;
}
