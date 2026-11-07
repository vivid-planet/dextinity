import { gql } from "@apollo/client";

export const brevoContactsListItemFragment = gql`
    fragment BrevoContactsListItem on BrevoContact {
        id
        createdAt
        modifiedAt
        email
        emailBlacklisted
    }
`;
