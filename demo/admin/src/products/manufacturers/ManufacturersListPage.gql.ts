import { gql } from "@apollo/client";

export const manufacturersListQuery = gql`
    query ManufacturersUiList($offset: Int!, $limit: Int!, $sort: [ManufacturerSort!], $search: String, $filter: ManufacturerFilter) {
        manufacturers(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
            nodes {
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
                        country
                    }
                }
                addressAsEmbeddable {
                    country
                }
            }
            totalCount
        }
    }
`;

export const manufacturerCountriesQuery = gql`
    query ManufacturersUiCountries {
        manufacturerCountries(offset: 0, limit: 100) {
            nodes {
                id
                label
                used
            }
        }
    }
`;

export const deleteManufacturerMutation = gql`
    mutation ManufacturersUiDelete($id: ID!) {
        deleteManufacturer(id: $id)
    }
`;
