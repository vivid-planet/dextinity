import { type ApolloClient, gql } from "@apollo/client";
import pDebounce from "p-debounce";
import { FormattedMessage } from "react-intl";

import type { GQLCheckProductSlugQuery, GQLCheckProductSlugQueryVariables } from "./validateProductSlug.generated";

async function validateProductSlugImpl({ value, client, id }: { value: string; client: ApolloClient; id?: string }) {
    const slugQuery = await client.query<GQLCheckProductSlugQuery, GQLCheckProductSlugQueryVariables>({
        query: gql`
            query CheckProductSlug($slug: String!) {
                productBySlug(slug: $slug) {
                    id
                }
            }
        `,
        variables: { slug: value },
    });
    if (slugQuery.data?.productBySlug && slugQuery.data.productBySlug.id !== id) {
        return (
            <FormattedMessage id="product.validate.slugMustBeUnique" defaultMessage="Slug must be unique. A product with this slug already exists." />
        );
    }
}

export const validateProductSlug = pDebounce(validateProductSlugImpl, 500);
