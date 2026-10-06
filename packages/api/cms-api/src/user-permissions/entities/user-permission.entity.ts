import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { v4 as uuid } from "uuid";

import type { ContentScope } from "../interfaces/content-scope.interface.js";
import { CombinedPermission, type Permission } from "../user-permissions.types.js";

export enum UserPermissionSource {
    MANUAL = "MANUAL",
    BY_RULE = "BY_RULE",
}
registerEnumType(UserPermissionSource, {
    name: "UserPermissionSource",
});

@ObjectType()
@Entity({ tableName: "DextinityUserPermission" })
export class UserPermission extends BaseEntity {
    @Field(() => ID)
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    userId: string;

    @Field(() => UserPermissionSource)
    source: UserPermissionSource;

    @Field(() => CombinedPermission)
    @Property({ columnType: "text" })
    permission: Permission;

    @Field(() => Date, { nullable: true })
    @Property({ columnType: "date", nullable: true })
    validFrom?: Date;

    @Field(() => Date, { nullable: true })
    @Property({ columnType: "date", nullable: true })
    validTo?: Date;

    @Field({ nullable: true })
    @Property({ columnType: "text", nullable: true })
    reason?: string;

    @Field({ nullable: true })
    @Property({ columnType: "text", nullable: true })
    requestedBy?: string;

    @Field({ nullable: true })
    @Property({ columnType: "text", nullable: true })
    approvedBy?: string;

    @Field()
    @Property()
    overrideContentScopes: boolean = false;

    @Field(() => [GraphQLJSONObject])
    @Property({ type: "json" })
    contentScopes: ContentScope[] = [];
}
