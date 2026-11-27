import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FullTextSearchHighlight {
    @Field(() => Int)
    start: number;

    @Field(() => Int, { description: "Exclusive" })
    end: number;
}

@ObjectType()
export class FullTextSearchSnippet {
    @Field()
    text: string;

    @Field(() => [FullTextSearchHighlight])
    highlights: FullTextSearchHighlight[];

    @Field({ description: "Words before the text were cut off" })
    truncatedStart: boolean;

    @Field({ description: "Words after the text were cut off" })
    truncatedEnd: boolean;
}

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

    @Field(() => [FullTextSearchHighlight], { description: "The search terms in the name" })
    titleHighlights: FullTextSearchHighlight[];

    @Field({ nullable: true })
    secondaryInformation?: string;

    @Field()
    visible: boolean;

    @Field(() => FullTextSearchSnippet, { nullable: true, description: "The part of the content that matches the search best" })
    snippet?: FullTextSearchSnippet;
}
