import { Embeddable, Property } from "@mikro-orm/postgresql";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@Embeddable()
@ObjectType("PageTreeNodeScope") // name must not be changed in the app
@InputType("PageTreeNodeScopeInput") // name must not be changed in the app
// @TODO: disguise @ObjectType("PageTreeContentScope") and @InputType("PageTreeContentScopeInput") decorators under a custom decorator: f.i. @PageTreeNodeScope
export class PageTreeNodeScope {
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    language: string;
}
