import { mswResolver } from "@graphql-mocks/network-msw";
import { GraphQLHandler } from "graphql-mocks";
import { http } from "msw";

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

const graphqlHandler = new GraphQLHandler({
    resolverMap: {
        Query: {
            launchesPastResult: launchesPastResultResolver,
            launchesPastPagePaging: launchesPastPagePagingResolver,
            currentUser: currentUserHandler,
            folder: folderHandler,
            subfolder: subfolderHandler,
        },
    },

    dependencies: {
        graphqlSchema,
    },
});

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handlers = [http.post("/graphql", mswResolver(graphqlHandler)), fileUploadsHandler, launchesPastRestHandler];
