import { gql } from "@apollo/client";

export const updateDamFinderFileMutation = gql`
    mutation UpdateDamFinderFile($id: ID!, $input: UpdateDamFileInput!) {
        updateDamFile(id: $id, input: $input) {
            id
            name
            title
            altText
        }
    }
`;

export const updateDamFinderFolderMutation = gql`
    mutation UpdateDamFinderFolder($id: ID!, $input: UpdateDamFolderInput!) {
        updateDamFolder(id: $id, input: $input) {
            id
            name
        }
    }
`;
