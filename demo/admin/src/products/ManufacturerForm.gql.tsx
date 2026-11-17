import { gql } from "@apollo/client";

export const manufacturerFormFragment = gql`
    fragment ManufacturerFormDetails on Manufacturer {
        name
        address {
            street
            streetNumber
            zip
            country
            alternativeAddress {
                street
                streetNumber
                zip
                country
            }
        }
        addressAsEmbeddable {
            street
            streetNumber
            zip
            country
            alternativeAddress {
                street
                streetNumber
                zip
                country
            }
        }
    }
`;
export const manufacturerQuery = gql`
    query Manufacturer($id: ID!) {
        manufacturer(id: $id) {
            id
            updatedAt
            ...ManufacturerFormDetails
        }
    }
    ${manufacturerFormFragment}
`;
export const createManufacturerMutation = gql`
    mutation CreateManufacturer($input: ManufacturerInput!) {
        createManufacturer(input: $input) {
            id
            updatedAt
            ...ManufacturerFormDetails
        }
    }
    ${manufacturerFormFragment}
`;
export const updateManufacturerMutation = gql`
    mutation UpdateManufacturer($id: ID!, $input: ManufacturerUpdateInput!) {
        updateManufacturer(id: $id, input: $input) {
            id
            updatedAt
            ...ManufacturerFormDetails
        }
    }
    ${manufacturerFormFragment}
`;
