import { ScopedEntity } from "@dextinity/cms-api";
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps, type Rel } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { News } from "./news.entity.js";

@Entity()
@ObjectType()
@ScopedEntity("news.scope")
export class NewsComment extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @ManyToOne(() => News)
    news!: Rel<News>;

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
