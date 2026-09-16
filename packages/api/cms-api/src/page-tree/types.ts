import { registerEnumType } from "@nestjs/graphql";

import type { ScopeInterface } from "../user-permissions/interfaces/scope.interface";
import type { PageTreeNodeBaseCreateInput, PageTreeNodeBaseUpdateInput } from "./dto/page-tree-node.input";
import type { PageTreeNodeBase } from "./entities/page-tree-node-base.entity";

export type PageTreeNodeCategory = string;
export type PageTreeNodeInterface = PageTreeNodeBase & { scope?: ScopeInterface };
export type PageTreeNodeCreateInputInterface = PageTreeNodeBaseCreateInput;
export type PageTreeNodeUpdateInputInterface = PageTreeNodeBaseUpdateInput;

export enum PageTreeNodeVisibility {
    Published = "Published",
    Unpublished = "Unpublished",
    Archived = "Archived",
}

registerEnumType(PageTreeNodeVisibility, { name: "PageTreeNodeVisibility" });
