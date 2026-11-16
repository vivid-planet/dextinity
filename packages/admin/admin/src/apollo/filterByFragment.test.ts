// Copied and adapted from https://github.com/apollographql/apollo-client/blob/release-2.x/packages/graphql-anywhere/src/__tests__/utilities.ts
import { disableFragmentWarnings, gql } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { filterByFragment } from "./filterByFragment";

// Turn off warnings for repeated fragment names
disableFragmentWarnings();

describe("filterByFragment", () => {
    describe("with a single query", () => {
        const doc = gql`
            {
                alias: name
                height(unit: METERS)
                avatar {
                    square
                }
            }
        `;
        const fragment = gql`
            fragment foo on Foo {
                alias: name
                height(unit: METERS)
                avatar {
                    square
                }
            }
        `;
        const fragmentWithAVariable = gql`
            fragment foo on Foo {
                alias: name
                height(unit: METERS)
                avatar @include(if: $foo) {
                    square
                }
            }
        `;
        const data = {
            alias: "Bob",
            name: "Wrong",
            height: 1.89,
            avatar: {
                square: "abc",
                circle: "def",
                triangle: "qwe",
            },
        };
        const filteredData = {
            alias: "Bob",
            height: 1.89,
            avatar: {
                square: "abc",
            },
        };
        const arrayData = [
            {
                alias: "Bob",
                name: "Wrong",
                height: 1.89,
                avatar: {
                    square: "abc",
                    circle: "def",
                    triangle: "qwe",
                },
            },
            {
                alias: "Tom",
                name: "Right",
                height: 1.77,
                avatar: {
                    square: "jkl",
                    circle: "bnm",
                    triangle: "uio",
                },
            },
        ];
        const filteredArrayData = [
            {
                alias: "Bob",
                height: 1.89,
                avatar: {
                    square: "abc",
                },
            },
            {
                alias: "Tom",
                height: 1.77,
                avatar: {
                    square: "jkl",
                },
            },
        ];

        it("can filter data", () => {
            expect(filterByFragment(doc, data)).toEqual(filteredData);
        });

        it("can filter an array of data", () => {
            expect(filterByFragment(doc, arrayData)).toEqual(filteredArrayData);
        });

        it("can short circuit when data is null", () => {
            expect(filterByFragment(doc, null)).toEqual(null);
        });

        it("can filter data for fragments", () => {
            expect(filterByFragment(fragment, data)).toEqual(filteredData);
        });

        it("can filter data for fragments with variables", () => {
            expect(filterByFragment(fragmentWithAVariable, data, { foo: true })).toEqual(filteredData);
        });

        it("omits fields excluded by @include", () => {
            expect(filterByFragment(fragmentWithAVariable, data, { foo: false })).toEqual({ alias: "Bob", height: 1.89 });
        });

        it("omits fields excluded by @skip", () => {
            const fragmentWithSkip = gql`
                fragment foo on Foo {
                    alias: name
                    height(unit: METERS)
                    avatar @skip(if: $foo) {
                        square
                    }
                }
            `;

            expect(filterByFragment(fragmentWithSkip, data, { foo: true })).toEqual({ alias: "Bob", height: 1.89 });
            expect(filterByFragment(fragmentWithSkip, data, { foo: false })).toEqual(filteredData);
        });

        it("can filter data for named fragment spreads", () => {
            const fragmentWithSpread = gql`
                fragment foo on Foo {
                    alias: name
                    height(unit: METERS)
                    avatar {
                        ...avatarFields
                    }
                }

                fragment avatarFields on Avatar {
                    square
                }
            `;

            expect(filterByFragment(fragmentWithSpread, data)).toEqual(filteredData);
        });
    });

    describe("with a single fragment", () => {
        const doc = gql`
            fragment PersonDetails on Person {
                alias: name
                height(unit: METERS)
                avatar {
                    square
                }
            }
        `;
        const data = {
            alias: "Bob",
            name: "Wrong",
            height: 1.89,
            avatar: {
                square: "abc",
                circle: "def",
                triangle: "qwe",
            },
        };
        const filteredData = {
            alias: "Bob",
            height: 1.89,
            avatar: {
                square: "abc",
            },
        };
        const arrayData = [
            {
                alias: "Bob",
                name: "Wrong",
                height: 1.89,
                avatar: {
                    square: "abc",
                    circle: "def",
                    triangle: "qwe",
                },
            },
            {
                alias: "Tom",
                name: "Right",
                height: 1.77,
                avatar: {
                    square: "jkl",
                    circle: "bnm",
                    triangle: "uio",
                },
            },
        ];
        const filteredArrayData = [
            {
                alias: "Bob",
                height: 1.89,
                avatar: {
                    square: "abc",
                },
            },
            {
                alias: "Tom",
                height: 1.77,
                avatar: {
                    square: "jkl",
                },
            },
        ];

        it("can filter data", () => {
            expect(filterByFragment(doc, data)).toEqual(filteredData);
        });

        it("can filter an array of data", () => {
            expect(filterByFragment(doc, arrayData)).toEqual(filteredArrayData);
        });
    });

    describe("with a single fragment", () => {
        const doc = gql`
            fragment PersonDetails on Person {
                alias: name
                height(unit: METERS)
                avatar {
                    square
                }
            }
        `;
        const data = {
            alias: "Bob",
            name: "Wrong",
            height: 1.89,
            avatar: {
                square: "abc",
                circle: "def",
                triangle: "qwe",
            },
        };
        const filteredData = {
            alias: "Bob",
            height: 1.89,
            avatar: {
                square: "abc",
            },
        };
        const arrayData = [
            {
                alias: "Bob",
                name: "Wrong",
                height: 1.89,
                avatar: {
                    square: "abc",
                    circle: "def",
                    triangle: "qwe",
                },
            },
            {
                alias: "Tom",
                name: "Right",
                height: 1.77,
                avatar: {
                    square: "jkl",
                    circle: "bnm",
                    triangle: "uio",
                },
            },
        ];
        const filteredArrayData = [
            {
                alias: "Bob",
                height: 1.89,
                avatar: {
                    square: "abc",
                },
            },
            {
                alias: "Tom",
                height: 1.77,
                avatar: {
                    square: "jkl",
                },
            },
        ];

        it("can filter data", () => {
            expect(filterByFragment(doc, data)).toEqual(filteredData);
        });

        it("can filter an array of data", () => {
            expect(filterByFragment(doc, arrayData)).toEqual(filteredArrayData);
        });
    });

    describe("with nested fragments", () => {
        const doc = gql`
            fragment PersonDetails on Person {
                alias: name
                height(unit: METERS)
                avatar {
                    square
                    ... on Avatar {
                        circle
                    }
                }
            }
        `;
        const data = {
            alias: "Bob",
            name: "Wrong",
            height: 1.89,
            avatar: {
                square: "abc",
                circle: "def",
                triangle: "qwe",
            },
        };
        const filteredData = {
            alias: "Bob",
            height: 1.89,
            avatar: {
                square: "abc",
                circle: "def",
            },
        };
        const arrayData = [
            {
                alias: "Bob",
                name: "Wrong",
                height: 1.89,
                avatar: {
                    square: "abc",
                    circle: "def",
                    triangle: "qwe",
                },
            },
            {
                alias: "Tom",
                name: "Right",
                height: 1.77,
                avatar: {
                    square: "jkl",
                    circle: "bnm",
                    triangle: "uio",
                },
            },
        ];
        const filteredArrayData = [
            {
                alias: "Bob",
                height: 1.89,
                avatar: {
                    square: "abc",
                    circle: "def",
                },
            },
            {
                alias: "Tom",
                height: 1.77,
                avatar: {
                    square: "jkl",
                    circle: "bnm",
                },
            },
        ];

        it("can filter data", () => {
            expect(filterByFragment(doc, data)).toEqual(filteredData);
        });

        it("can filter an array of data", () => {
            expect(filterByFragment(doc, arrayData)).toEqual(filteredArrayData);
        });

        describe("if the nested fragment has not matched", () => {
            it("can filter data", () => {
                const filtered = filterByFragment(doc, {
                    alias: "Bob",
                    name: "Wrong",
                    height: 1.89,
                    avatar: {
                        square: "abc",
                        // there is no circle field here, but we can't know if that's not
                        // because avatar is not an Avatar
                        triangle: "qwe",
                    },
                });

                expect(filtered).toEqual({
                    alias: "Bob",
                    height: 1.89,
                    avatar: {
                        square: "abc",
                    },
                });
            });
        });
    });
});
