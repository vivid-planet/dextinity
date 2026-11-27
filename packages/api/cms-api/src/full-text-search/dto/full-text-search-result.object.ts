import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FullTextSearchResult {
    @Field()
    id: string;

    @Field()
    entityName: string;

    @Field({ description: "The document type for page tree nodes (e.g. Page, Link), the entity name otherwise" })
    type: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    secondaryInformation?: string;

    @Field()
    visible: boolean;
}
