import type { Type } from "@nestjs/common";
import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory.js";
import type { PageTreeNodeInterface } from "../types.js";

export class PaginatedPageTreeNodesFactory {
    static create({ PageTreeNode }: { PageTreeNode: Type<PageTreeNodeInterface> }): Type {
        @ObjectType()
        class PaginatedPageTreeNodes extends PaginatedResponseFactory.create(PageTreeNode) {}

        return PaginatedPageTreeNodes;
    }
}
