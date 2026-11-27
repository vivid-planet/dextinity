import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FullTextSearchType {
    @Field({ description: "The document type for page tree nodes (e.g. Page, Link), the entity name otherwise" })
    type: string;

    @Field()
    entityName: string;
}
