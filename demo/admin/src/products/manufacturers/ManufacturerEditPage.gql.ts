import { gql } from "@apollo/client";

const manufacturerEditFragment = gql`
    fragment ManufacturersUiEdit on Manufacturer {
        id
        name
        productType
        updatedAt
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
        coordinates {
            latitude
            longitude
        }
    }
`;

export const manufacturerEditQuery = gql`
    query ManufacturersUiEdit($id: ID!) {
        manufacturer(id: $id) {
            ...ManufacturersUiEdit
        }
    }
    ${manufacturerEditFragment}
`;

export const createManufacturerMutation = gql`
    mutation ManufacturersUiCreate($input: ManufacturerInput!) {
        createManufacturer(input: $input) {
            ...ManufacturersUiEdit
        }
    }
    ${manufacturerEditFragment}
`;

export const updateManufacturerMutation = gql`
    mutation ManufacturersUiUpdate($id: ID!, $input: ManufacturerUpdateInput!) {
        updateManufacturer(id: $id, input: $input) {
            ...ManufacturersUiEdit
        }
    }
    ${manufacturerEditFragment}
`;
