import { Embeddable, Index, Property } from "@mikro-orm/postgresql";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@Embeddable()
@ObjectType("RedirectScope") // name must not be changed in the app
@InputType("RedirectScopeInput") // name must not be changed in the app
// @TODO: disguise @ObjectType("RedirectScope") and @InputType("RedirectScopeInput") decorators under a custom decorator: f.i. @RedirectScope
export class RedirectScope {
    @Index() // this does nothing, migration has to be created manually as the entity is in library
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;
}
