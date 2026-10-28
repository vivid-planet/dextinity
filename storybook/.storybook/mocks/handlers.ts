import { buildSchema, defaultFieldResolver, graphql, type GraphQLFieldResolver } from "graphql";
import { http, HttpResponse } from "msw";

import { currentUserHandler } from "./currentUserHandler";
import { fileUploadsHandler } from "./fileUploadsHandler";
import { folderHandler, subfolderHandler } from "./foldersHandler";
import { launchesPastPagePagingResolver, launchesPastRestHandler, launchesPastResultResolver } from "./launchesPastHandler";

export type { LaunchesPastPagePagingResult, LaunchesPastResult } from "./launchesPastHandler";

const graphqlSchema = `
schema {
  query: Query
}

scalar Date
scalar DateTime
scalar JSONObject @specifiedBy(url: "http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf")

type Launch {
    id: ID!
    mission_name: String!
    launch_date_local: Date!
}

type Result {
    totalCount: Int!
}

type LaunchesPastResult {
    data: [Launch!]!
    result: Result!
}

type LaunchesPastPagePagingResult {
    nodes: [Launch!]!
    totalCount: Int!
    nextPage: Int
    previousPage: Int
    totalPages: Int
}

input StringFilter {
    contains: String
    equal: String
}

input DateFilter {
    equal: DateTime
}

input LaunchesPastFilter {
    launch_date_local: DateFilter
    mission_name: StringFilter
    or: [LaunchesPastFilter!]
    and: [LaunchesPastFilter!]
}

type CurrentUser {
  id: String!
  name: String!
  email: String!
  permissions: [CurrentUserPermission!]!
  impersonated: Boolean
  accountUrl: String
  authenticatedUser: UserPermissionsUser
  permissionsForScope(scope: JSONObject!): [String!]!
  allowedContentScopes: [ContentScopeWithLabel!]!
}

type CurrentUserPermission {
  permission: Permission!
  contentScopes: [JSONObject!]!
}

enum Permission {
  builds
  dam
  pageTree
  cronJobs
  translation
  userPermissions
  prelogin
  impersonation
  fileUploads
  dependencies
  warnings
  news
}

type UserPermissionsUser {
  id: String!
  name: String!
  email: String!
  impersonationAllowed: Boolean!
}

type ContentScopeWithLabel {
  scope: JSONObject!
  label: JSONObject!
}

type Folder {
  id: ID!
  name: String!
}

type Query {
    launchesPastResult(limit: Int, offset: Int, sort: String, order: String, filter: LaunchesPastFilter): LaunchesPastResult!
    launchesPastPagePaging(page: Int, size: Int): LaunchesPastPagePagingResult!
    currentUser: CurrentUser!
    folder(id: ID): Folder
    subfolder(id: ID): [Folder!]!
}
`;

const schema = buildSchema(graphqlSchema);

const queryResolvers: Record<string, GraphQLFieldResolver<unknown, unknown>> = {
    launchesPastResult: launchesPastResultResolver,
    launchesPastPagePaging: launchesPastPagePagingResolver,
    currentUser: currentUserHandler,
    folder: folderHandler,
    subfolder: subfolderHandler,
};

const fieldResolver: GraphQLFieldResolver<unknown, unknown> = (source, args, context, info) => {
    const queryResolver = info.parentType.name === "Query" ? queryResolvers[info.fieldName] : undefined;
    return (queryResolver ?? defaultFieldResolver)(source, args, context, info);
};

const graphqlHandler = http.post("/graphql", async ({ request }) => {
    const { query, variables, operationName } = (await request.json()) as {
        query: string;
        variables?: Record<string, unknown>;
        operationName?: string;
    };
    const result = await graphql({ schema, source: query, variableValues: variables, operationName, fieldResolver });
    return HttpResponse.json(result);
});

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handlers = [graphqlHandler, fileUploadsHandler, launchesPastRestHandler];
