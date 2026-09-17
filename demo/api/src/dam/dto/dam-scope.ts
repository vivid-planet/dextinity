import { Embeddable, Property } from "@mikro-orm/decorators/legacy";
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
