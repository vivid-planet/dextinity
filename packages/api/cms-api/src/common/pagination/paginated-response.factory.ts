import type { Type } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";

export class PaginatedResponseFactory {
    static create<TNodeValue>(classRef: Type<TNodeValue>): Type {
        @ObjectType()
        class PaginatedType {
            @Field(() => [classRef])
            nodes: TNodeValue[];

            @Field(() => Int)
            totalCount: number;

            constructor(nodes: TNodeValue[], totalCount: number) {
                this.nodes = nodes;
                this.totalCount = totalCount;
            }
        }

        return PaginatedType;
    }
}
