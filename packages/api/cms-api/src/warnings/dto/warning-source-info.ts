import { Property } from "@mikro-orm/decorators/legacy";
import { Field, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@InputType("WarningSourceInfoInput")
export class WarningSourceInfo {
    @Property()
    @Field()
    rootEntityName: string;

    @Property()
    @Field()
    targetId: string;

    @Property({ nullable: true })
    @Field({ nullable: true })
    rootColumnName?: string;

    @Property()
    @Field()
    rootPrimaryKey: string;

    @Property({ nullable: true })
    @Field({ nullable: true })
    jsonPath?: string;
}
