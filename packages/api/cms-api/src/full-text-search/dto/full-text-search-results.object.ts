import { Field, Int, ObjectType } from "@nestjs/graphql";

import { FullTextSearchResult } from "./full-text-search-result.object.js";

@ObjectType()
export class FullTextSearchTypeCount {
    @Field()
    type: string;

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class FullTextSearchResults {
    @Field(() => [FullTextSearchResult])
    nodes: FullTextSearchResult[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => [FullTextSearchTypeCount], { description: "Number of results per type" })
    types: FullTextSearchTypeCount[];
}
