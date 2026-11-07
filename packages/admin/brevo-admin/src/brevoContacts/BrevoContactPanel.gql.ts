import { gql } from "@apollo/client";

import type { AdditionalAttributesFragment } from "./additionalAttributesFragment";

export const brevoContactDetailQuery = (additionalAttributesFragment?: AdditionalAttributesFragment) => gql`
    query BrevoContactDetail($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        brevoContact(id: $id, scope: $scope) {
            id
            email
            createdAt
            modifiedAt
            emailBlacklisted
            ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment.name) : ""}
        }
    }
    ${additionalAttributesFragment?.fragment ?? ""}
`;

export const brevoContactModifiedAtQuery = gql`
    query BrevoContactModifiedAt($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        brevoContact(id: $id, scope: $scope) {
            id
            modifiedAt
        }
    }
`;

export const createBrevoContactMutation = gql`
    mutation CreateBrevoContact($scope: EmailCampaignContentScopeInput!, $input: BrevoContactInput!) {
        createBrevoContact(scope: $scope, input: $input)
    }
`;

export const createBrevoTestContactMutation = gql`
    mutation CreateBrevoTestContact($scope: EmailCampaignContentScopeInput!, $input: BrevoTestContactInput!) {
        createBrevoTestContact(scope: $scope, input: $input)
    }
`;

export const updateBrevoContactMutation = (additionalAttributesFragment?: AdditionalAttributesFragment) => gql`
    mutation UpdateBrevoContact($id: Int!, $input: BrevoContactUpdateInput!, $scope: EmailCampaignContentScopeInput!) {
        updateBrevoContact(id: $id, input: $input, scope: $scope) {
            id
            modifiedAt
            emailBlacklisted
            ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment.name) : ""}
        }
    }
    ${additionalAttributesFragment?.fragment ?? ""}
`;
