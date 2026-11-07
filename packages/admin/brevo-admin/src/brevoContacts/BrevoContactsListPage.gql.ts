import { gql } from "@apollo/client";

import type { AdditionalAttributesFragment } from "./additionalAttributesFragment";
import { brevoContactsListItemFragment } from "./brevoContactsListItemFragment";

export const brevoContactsListQuery = (additionalAttributesFragment?: AdditionalAttributesFragment) => gql`
    query BrevoContactsList($offset: Int!, $limit: Int!, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoContactsListItem
                ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment.name) : ""}
            }
            totalCount
        }
    }
    ${brevoContactsListItemFragment}
    ${additionalAttributesFragment?.fragment ?? ""}
`;

export const brevoTestContactsListQuery = (additionalAttributesFragment?: AdditionalAttributesFragment) => gql`
    query BrevoTestContactsList($offset: Int!, $limit: Int!, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoTestContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoContactsListItem
                ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment.name) : ""}
            }
            totalCount
        }
    }
    ${brevoContactsListItemFragment}
    ${additionalAttributesFragment?.fragment ?? ""}
`;

export const updateBrevoContactBlockedMutation = gql`
    mutation UpdateBrevoContactBlocked($id: Int!, $blocked: Boolean!, $scope: EmailCampaignContentScopeInput!) {
        updateBrevoContact(id: $id, input: { blocked: $blocked }, scope: $scope) {
            id
            modifiedAt
            emailBlacklisted
        }
    }
`;

export const deleteBrevoContactMutation = gql`
    mutation DeleteBrevoContact($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        deleteBrevoContact(id: $id, scope: $scope)
    }
`;

export const deleteBrevoTestContactMutation = gql`
    mutation DeleteBrevoTestContact($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        deleteBrevoTestContact(id: $id, scope: $scope)
    }
`;
