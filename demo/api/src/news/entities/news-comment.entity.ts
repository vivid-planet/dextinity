import { ScopedEntity } from "@dextinity/cms-api";
import { BaseEntity, Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { News } from "./news.entity";

@Entity()
@ObjectType()
@ScopedEntity("news.scope")
export class NewsComment extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @ManyToOne(() => News)
    news!: News;

    @Property()
    @Field()
    comment: string;

    @Property({
        columnType: "timestamp with time zone",
    })
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date(), columnType: "timestamp with time zone" })
    @Field()
    updatedAt: Date = new Date();
}
