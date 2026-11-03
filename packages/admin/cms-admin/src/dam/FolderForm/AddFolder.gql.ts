import { gql } from "@apollo/client";

export const createDamFolderMutation = gql`
    mutation CreateDamFolder($input: CreateDamFolderInput!, $scope: DamScopeInput!) {
        createDamFolder(input: $input, scope: $scope) {
            id
            name
            mpath
        }
    }
`;
