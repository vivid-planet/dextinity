import { BaseEntity, OptionalProps, PrimaryKeyProp } from "@mikro-orm/core";
import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { v7 } from "uuid";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";

@Entity()
@ObjectType()
@Index({ properties: ["entityName", "entityId", "version"] })
export class ActionLog extends BaseEntity {
    [PrimaryKeyProp]?: "id";
    [OptionalProps]?: "createdAt";

    @Field(() => ID)
    @PrimaryKey({ type: "uuid" })
    id: string = v7();

    @Field(() => [GraphQLJSONObject], { nullable: true })
    @Property({ type: "jsonb", nullable: true })
    @Index({ type: "gin" })
    scope?: ContentScope[];

    @Property({ type: "text", index: true })
    userId: string;

    @Field()
    @Property({ type: "text" })
    entityName: string;

    @Field(() => ID)
    @Property({ type: "uuid" })
    entityId: string;

    @Field(() => Int)
    @Property({ type: "integer" })
    version: number;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @Property({ type: "jsonb", nullable: true })
    snapshot?: Record<string, unknown>;

    @Field()
    @Property({ type: Date, columnType: "timestamp with time zone" })
    createdAt: Date = new Date();
}
