import { Embeddable, Property } from "@mikro-orm/postgresql";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@Embeddable()
@ObjectType()
@InputType("DamScopeInput")
export class DamScope {
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;
}
