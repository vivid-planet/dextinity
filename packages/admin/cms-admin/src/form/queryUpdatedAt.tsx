import { type ApolloClient, gql } from "@apollo/client";

export async function queryUpdatedAt(client: ApolloClient, rootQueryName: string, id: string | undefined): Promise<string | undefined> {
    if (!id) {
        return undefined;
    }

    const query = gql`
        query ($id: ID!) {
            ${rootQueryName}(id: $id) {
                updatedAt
            }
        }
    `;
    const { data } = await client.query<Record<string, { updatedAt: string } | null>>({
        query,
        variables: { id },
        fetchPolicy: "no-cache",
    });
    return data?.[rootQueryName]?.updatedAt;
}
