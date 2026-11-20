import { Field, Int, ObjectType } from "@nestjs/graphql";

import { FullTextSearchResult } from "./full-text-search-result.object";

@ObjectType()
export class FullTextSearchTypeCount {
    @Field()
    type: string;

    @Field()
    entityName: string;

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class FullTextSearchResults {
    @Field(() => [FullTextSearchResult])
    nodes: FullTextSearchResult[];

    @Field(() => Int, { description: "Number of results matching the types filter" })
    totalCount: number;

    @Field(() => [FullTextSearchTypeCount], { description: "Number of results per type, ignoring the types filter" })
    types: FullTextSearchTypeCount[];

    constructor({ nodes, totalCount, types }: { nodes: FullTextSearchResult[]; totalCount: number; types: FullTextSearchTypeCount[] }) {
        this.nodes = nodes;
        this.totalCount = totalCount;
        this.types = types;
    }
}
