import type { GraphQLFieldResolver } from "graphql";

import { sleep } from "./handlers";

enum GQLPermission {
    builds = "builds",
    dam = "dam",
    pageTree = " pageTree",
    cronJobs = " cronJobs",
    translation = "translation",
    userPermissions = "userPermissions",
    prelogin = "prelogin",
    impersonation = "impersonation",
    fileUploads = "fileUploads",
    dependencies = "dependencies",
    warnings = "warnings",
    news = "news",
    products = "products",
    manufacturers = "manufacturers",
}
type GQLCurrentUserPermission = {
    permission: GQLPermission;
    contentScopes: Array<any>;
};

type GQLUserPermissionsUser = {
    id: string;
    name: string;
    email: string;
    impersonationAllowed: boolean;
};
type GQLContentScopeWithLabel = {
    scope: any;
    label: any;
};
type GQLCurrentUser = {
    id: string;
    name: string;
    email: string;
    permissions: Array<GQLCurrentUserPermission>;
    impersonated: boolean;
    authenticatedUser: GQLUserPermissionsUser;
    allowedContentScopes: Array<GQLContentScopeWithLabel>;
};

export const currentUserHandler: GraphQLFieldResolver<unknown, unknown, { currentUser?: GQLCurrentUser }> = async (source, { currentUser }) => {
    await sleep(500);

    return {
        id: "1",
        impersonated: false,
        name: "Max Mustermann",
        email: "max@mustermann.com",
        permissions: [],
        authenticatedUser: {
            email: "max@mustermann.com",
            impersonationAllowed: true,
            name: "Max Mustermann",
            id: "1",
        },
        allowedContentScopes: [],
    } satisfies GQLCurrentUser;
};
