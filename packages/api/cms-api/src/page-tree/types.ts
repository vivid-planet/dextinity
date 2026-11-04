import { registerEnumType } from "@nestjs/graphql";

import type { PageTreeNodeBaseCreateInput, PageTreeNodeBaseUpdateInput } from "./dto/page-tree-node.input";
import type { PageTreeNodeBase } from "./entities/page-tree-node-base.entity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScopeInterface = Record<string, any>; //@TODO: move to general scope (other modules (redirect, dam) need this too)
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
