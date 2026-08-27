import type { TypedDocumentNode } from "@apollo/client";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType, ReactNode } from "react";

import type { BlockDependency, ReplaceDependencyObject } from "../blocks/types";
import type { GQLDocumentInterface, Maybe } from "../graphql.generated";
import type { PageTreePage } from "../pages/pageTree/usePageTree";

export type DocumentType = string;

export interface GQLPageQuery {
    page: Maybe<{
        document: Maybe<GQLDocument>;
    }>;
}

export interface GQLPageQueryVariables {
    id: string;
}

interface GQLUpdatePageMutation {
    id: string;
}

export interface GQLUpdatePageMutationVariables<DocumentOutput = Record<string, unknown>> {
    pageId: string;
    input: DocumentOutput;
    attachedPageTreeNodeId?: string | null;
}

export interface GQLDocument extends GQLDocumentInterface {
    __typename: DocumentType;
    [key: string]: unknown;
}

// The type parameters default to `any` (not `Record<string, unknown>`) because they appear in callback
// parameter positions. A collection of document types (e.g. `Record<DocumentType, DocumentInterface>`) is
// heterogeneous, so it must accept documents with a concrete input/output shape.
export interface DocumentInterface<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DocumentInput extends Record<string, unknown> = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DocumentOutput extends Record<string, unknown> = any,
> {
    displayName: ReactNode;
    getQuery?: TypedDocumentNode<GQLPageQuery, GQLPageQueryVariables>; // TODO better typing (see createUsePage.tsx)
    editComponent?: ComponentType<{ id: string; category: string }>;
    updateMutation?: TypedDocumentNode<GQLUpdatePageMutation, GQLUpdatePageMutationVariables<DocumentOutput>>;
    inputToOutput?: (input: DocumentInput) => DocumentOutput;
    menuIcon: (props: SvgIconProps<"svg">) => ReactNode;
    hideInMenuIcon?: (props: SvgIconProps<"svg">) => ReactNode;
    InfoTag?: ComponentType<InfoTagProps>;
    anchors: (input: DocumentInput) => string[];
    dependencies: (input: DocumentInput) => BlockDependency[];
    replaceDependenciesInOutput: (output: DocumentOutput, replacements: ReplaceDependencyObject[]) => DocumentOutput;
    hasNoSitePreview?: true;
    SitePreviewAction?: ComponentType<SitePreviewActionProps>;
}

// Defaults to `any` for the same reason as `DocumentInterface` above
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InfoTagProps<PageTreeNodeAdditionalFields extends object = any> = {
    page: PageTreePage<PageTreeNodeAdditionalFields>;
};

export type SitePreviewActionProps<PageTreeNodeAdditionalFields extends object = object> = {
    pageTreeNode: PageTreePage<PageTreeNodeAdditionalFields>;
};
