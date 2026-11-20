import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FullTextSearchHighlight {
    @Field(() => Int, { description: "UTF-16 offset of the first highlighted character" })
    start: number;

    @Field(() => Int, { description: "UTF-16 offset after the last highlighted character (exclusive)" })
    end: number;
}

@ObjectType()
export class FullTextSearchHighlightedText {
    @Field()
    text: string;

    @Field(() => [FullTextSearchHighlight])
    highlights: FullTextSearchHighlight[];

    @Field({ description: "The text was cut at the start, clients should render a leading ellipsis" })
    truncatedStart: boolean;

    @Field({ description: "The text was cut at the end, clients should render a trailing ellipsis" })
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

    @Field({ nullable: true })
    secondaryInformation?: string;

    @Field()
    visible: boolean;

    @Field({ description: "Some or all search terms occur in the name" })
    titleMatch: boolean;

    @Field(() => FullTextSearchHighlightedText)
    title: FullTextSearchHighlightedText;

    @Field(() => FullTextSearchHighlightedText, { nullable: true })
    snippet?: FullTextSearchHighlightedText;
}
