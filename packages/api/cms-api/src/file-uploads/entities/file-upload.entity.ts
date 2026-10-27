import { BaseEntity, BigIntType, Entity, Index, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";
import { GraphQLBigInt } from "graphql-scalars";

@ObjectType("FileUpload")
@Entity({ tableName: "DextinityFileUpload" })
export class FileUpload extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @Field(() => ID)
    @PrimaryKey({ columnType: "uuid" })
    id: string = randomUUID();

    @Field()
    @Property({ columnType: "text" })
    name: string;

    @Field(() => GraphQLBigInt)
    @Property({ type: new BigIntType("number") })
    size: number;

    @Field()
    @Property({ columnType: "text" })
    mimetype: string;

    @Field()
    @Property({ columnType: "character(32)" })
    @Index()
    contentHash: string;

    @Field()
    @Property({
        columnType: "timestamp with time zone",
    })
    createdAt: Date = new Date();

    @Field()
    @Property({
        columnType: "timestamp with time zone",
        onUpdate: () => new Date(),
    })
    updatedAt: Date = new Date();

    @Field({ nullable: true, description: "The date and time the file will be deleted. If undefined, the file will never be deleted." })
    @Property({
        columnType: "timestamp with time zone",
        nullable: true,
    })
    expiresAt?: Date;
}
