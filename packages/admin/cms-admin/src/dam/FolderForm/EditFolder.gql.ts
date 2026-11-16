import { gql } from "@apollo/client";

export const updateDamFolderMutation = gql`
    mutation UpdateDamFolder($id: ID!, $input: UpdateDamFolderInput!) {
        updateDamFolder(id: $id, input: $input) {
            id
            name
            isInboxFromOtherScope
        }
    }
`;

export const editFolderQuery = gql`
    query EditFolder($id: ID!) {
        damFolder(id: $id) {
            id
            name
        }
    }
`;
