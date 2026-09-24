import { ArrayType, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "@nestjs/graphql";

import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";

// Note: This file is intentionally not named *.entity.ts to exclude it from MikroORM's CLI migration glob pattern.
// The "EntityInfo" view is created dynamically at startup by EntityInfoService, not via migrations.

@Entity({ tableName: "EntityInfo" })
@ObjectType("EntityInfo")
export class EntityInfoObject {
    @PrimaryKey({ type: "text" })
    @Field()
    id: string;

    @PrimaryKey({ type: "text" })
    @Field()
    entityName: string;

    @Field()
    @Property({ type: "text" })
    name: string;

    @Field({ nullable: true })
    @Property({ type: "text", nullable: true })
    secondaryInformation?: string;

    @Property({ type: "boolean" })
    visible: boolean;

    @Property({ type: ArrayType })
    requiredPermission: string[];

    @Property({ type: "jsonb", nullable: true })
    scopes?: ContentScope[];
}
