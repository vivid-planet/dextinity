import type { GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, type ResolveTree } from "graphql-parse-resolve-info";
import { describe, expect, it, vi } from "vitest";

import { extractGraphqlFields } from "../extract-graphql-fields";

vi.mock("graphql-parse-resolve-info", () => ({
    parseResolveInfo: vi.fn(),
}));

const mockInfo = {} as GraphQLResolveInfo;

function makeTree(fieldsByTypeName: ResolveTree["fieldsByTypeName"]): ResolveTree {
    return { name: "root", alias: "root", args: {}, fieldsByTypeName };
}

function makeLeaf(name: string): ResolveTree {
    return { name, alias: name, args: {}, fieldsByTypeName: {} };
}

describe("extractGraphqlFields", () => {
    it("should return an empty array when there are no fields", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(makeTree({}));

        expect(extractGraphqlFields(mockInfo)).toEqual([]);
    });

    it("should return flat field names", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                User: {
                    name: makeLeaf("name"),
                    email: makeLeaf("email"),
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo)).toEqual(["name", "email"]);
    });

    it("should return nested field paths using dot notation", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                User: {
                    address: {
                        ...makeLeaf("address"),
                        fieldsByTypeName: {
                            Address: {
                                street: makeLeaf("street"),
                                city: makeLeaf("city"),
                            },
                        },
                    },
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo)).toEqual(["address", "address.street", "address.city"]);
    });

    it("should handle multiple levels of nesting", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                Query: {
                    user: {
                        ...makeLeaf("user"),
                        fieldsByTypeName: {
                            User: {
                                profile: {
                                    ...makeLeaf("profile"),
                                    fieldsByTypeName: {
                                        Profile: {
                                            avatar: makeLeaf("avatar"),
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo)).toEqual(["user", "user.profile", "user.profile.avatar"]);
    });

    it("should return only sub-fields of the specified root when root option is provided", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                Query: {
                    user: {
                        ...makeLeaf("user"),
                        fieldsByTypeName: {
                            User: {
                                name: makeLeaf("name"),
                                email: makeLeaf("email"),
                            },
                        },
                    },
                    version: makeLeaf("version"),
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo, { root: "user" })).toEqual(["name", "email"]);
    });

    it("should return an empty array when root has no matching children", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                Query: {
                    name: makeLeaf("name"),
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo, { root: "nonexistent" })).toEqual([]);
    });

    it("should not include the root field itself when root is a leaf node", () => {
        vi.mocked(parseResolveInfo).mockReturnValue(
            makeTree({
                Query: {
                    user: makeLeaf("user"),
                },
            }),
        );

        expect(extractGraphqlFields(mockInfo, { root: "user" })).toEqual([]);
    });
});
