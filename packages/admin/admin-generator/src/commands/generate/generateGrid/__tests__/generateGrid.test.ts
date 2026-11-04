import { buildSchema, type GraphQLSchema, introspectionFromSchema, type IntrospectionQuery } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";

import type { GridConfig } from "../../generate-command";
import { generateGrid } from "../generateGrid";

describe("generateGrid", () => {
    let schema: GraphQLSchema;
    let introspection: IntrospectionQuery;

    beforeAll(() => {
        schema = buildSchema(`
            scalar LocalDate
            input StringFilter {
                equal: String
            }

            type Query {
                books(
                    offset: Int!
                    limit: Int!
                    sort: [BookSort!]
                    filter: BookFilter
                ): PaginatedBooks!
                booksByAuthor(
                    authorId: ID!
                    offset: Int!
                    limit: Int!
                    sort: [BookSort!]
                    filter: BookFilter
                ): PaginatedBooks!
                allBooks(
                    sort: [BookSort!]
                    filter: BookFilter
                ): [Book!]!
                simpleBooks: [Book!]!
            }

            type PaginatedBooks {
                nodes: [Book!]!
                totalCount: Int!
            }

            type Author {
                id: ID!
                name: String!
                birthDate: LocalDate
            }

            enum BookStatus {
                Published
                Draft
                Archived
            }

            type BookDetails {
                status: BookStatus!
            }

            type Book {
                id: ID!
                title: String!
                author: Author!
                details: BookDetails!
            }

            input BookFilter {
                title: StringFilter
            }

            input BookSort {
                field: BookSortField!
                direction: SortDirection!
            }

            enum BookSortField {
                title
                author_birthDate
            }

            enum SortDirection {
                ASC
                DESC
            }

            type Mutation {
                createBook(author: ID!, input: BookInput!): Book!
                updateBook(id: ID!, input: BookInput!): Book!
                deleteBook(id: ID!): Boolean!
            }

            input BookInput {
                title: String!
            }
        `);

        introspection = introspectionFromSchema(schema);
    });

    type Book = {
        __typename: "Book";
        id: string;
        title: string;
        author?: {
            __typename: "Author";
            name: string;
            birthDate?: string;
        };
        details?: {
            __typename: "BookDetails";
            status: string;
        };
    };

    it("should generate a grid with book configuration", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });

    it("should generate required root gql args in export-query variables", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "booksByAuthor",
            excelExport: true,
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });

    it("should generate valueGetter for date in nested field", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "books",
            excelExport: true,
            columns: [
                {
                    type: "text",
                    name: "title",
                },
                {
                    type: "date",
                    name: "author.birthDate",
                    headerName: "Author Birthdate",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });

    it("should generate empty headerName without formattedMessage", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "books",
            excelExport: true,
            columns: [
                {
                    type: "text",
                    name: "title",
                    headerName: "",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatch(/field: "title",\s*headerName: "",/);
    });
    it("should generate a grid with density setting", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            density: "compact",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toContain('density="compact"');
    });

    it("should generate a grid without paging when query returns a list", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "allBooks",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
        // Should NOT contain offset/limit in the query
        expect(result.code).not.toMatch(/\$offset: Int!/);
        expect(result.code).not.toMatch(/\$limit: Int!/);
        // Should NOT contain nodes wrapper or totalCount
        expect(result.code).not.toContain("nodes {");
        expect(result.code).not.toContain("totalCount");
        // Should NOT contain rowCount
        expect(result.code).not.toContain("rowCount");
    });

    it("should generate a grid without paging, sort, or filter when query has no arguments", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "simpleBooks",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
        // Should NOT contain offset/limit
        expect(result.code).not.toMatch(/\$offset: Int!/);
        expect(result.code).not.toMatch(/\$limit: Int!/);
        // Should NOT contain nodes wrapper or totalCount
        expect(result.code).not.toContain("nodes {");
        expect(result.code).not.toContain("totalCount");
        // Should NOT contain rowCount
        expect(result.code).not.toContain("rowCount");
        // Should NOT contain sort or filter variables
        expect(result.code).not.toMatch(/\$sort:/);
        expect(result.code).not.toMatch(/\$filter:/);
        // The query should have no arguments at all
        expect(result.code).toMatch(/query BooksGrid \{/);
        expect(result.code).toMatch(/simpleBooks \{/);
    });

    it("should generate custom text for delete action in crudContextMenu", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "books",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
            crudContextMenu: {
                deleteText: "Extinguish",
            },
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });

    it("should omit sort variable when the schema has no sort arg", () => {
        const schemaWithoutSort = buildSchema(`
            type Query {
                books(
                    offset: Int!
                    limit: Int!
                ): PaginatedBooks!
            }

            type PaginatedBooks {
                nodes: [Book!]!
                totalCount: Int!
            }

            type Book {
                id: ID!
                title: String!
            }

            type Mutation {
                createBook(author: ID!, input: BookInput!): Book!
                updateBook(id: ID!, input: BookInput!): Book!
                deleteBook(id: ID!): Boolean!
            }

            input BookInput {
                title: String!
            }
        `);

        const introspectionWithoutSort = introspectionFromSchema(schemaWithoutSort);

        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspectionWithoutSort,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });
    it("should generate initialFilter with non-string values without wrapping them in quotes", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            initialFilter: {
                items: [
                    { field: "title", operator: "contains", value: "foo" },
                    { field: "hasParticipated", operator: "is", value: true },
                    { field: "count", operator: "=", value: 42 },
                ],
            },
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        // String value should remain quoted
        expect(result.code).toMatch(/value: "foo"/);
        // Boolean value should NOT be quoted
        expect(result.code).toMatch(/value: true/);
        expect(result.code).not.toMatch(/value: "true"/);
        // Number value should NOT be quoted
        expect(result.code).toMatch(/value: 42/);
        expect(result.code).not.toMatch(/value: "42"/);
    });
    it("should pass initialPageSize as pageSize to useDataGridRemote", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            initialPageSize: 50,
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatch(/useDataGridRemote\(\{[^}]*pageSize: 50/s);
    });
    it("should generate onRowClick prop when rowActionProp is true", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            rowActionProp: true,
            columns: [
                {
                    type: "text",
                    name: "title",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        // Should contain the onRowClick prop type definition
        expect(result.code).toMatch(/onRowClick\?: DataGridProps\["onRowClick"\]/);
        // Should forward onRowClick to the DataGrid component
        expect(result.code).toMatch(/onRowClick={onRowClick}/);
        // Should NOT contain the handleRowClick function
        expect(result.code).not.toMatch(/const handleRowClick:/);
    });
    it("should generate a grid with nested staticSelect field", () => {
        const config: GridConfig<Book> = {
            type: "grid",
            gqlType: "Book",
            query: "books",
            columns: [
                {
                    type: "text",
                    name: "title",
                },
                {
                    type: "staticSelect",
                    name: "details.status",
                },
            ],
        };

        const result = generateGrid(
            {
                exportName: "BooksGrid",
                baseOutputFilename: "BooksGrid",
                targetDirectory: "/test",
                gqlIntrospection: introspection,
            },
            config,
        );

        expect(result.code).toMatchSnapshot();
    });
});
