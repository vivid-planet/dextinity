import { Type } from "@nestjs/common";
import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory";
import { PageTreeNodeInterface } from "../types";

export class PaginatedPageTreeNodesFactory {
    static create({ PageTreeNode }: { PageTreeNode: Type<PageTreeNodeInterface> }): Type {
        @ObjectType()
        class PaginatedPageTreeNodes extends PaginatedResponseFactory.create(PageTreeNode) {}

        return PaginatedPageTreeNodes;
    }
}
