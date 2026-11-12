import { graphql } from "msw/graphql";

export const graphqlApi = graphql.link("/graphql");
