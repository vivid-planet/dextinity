import { defineConfig } from "@dextinity/admin-generator";
import type { GQLManufacturer } from "@src/graphql.generated";

export default defineConfig<GQLManufacturer>({
    type: "grid",
    gqlType: "Manufacturer",
    fragmentName: "ManufacturersGridFuture", // configurable as it must be unique across project
    queryParamsPrefix: "manufacturers",
    newEntryText: "Add Manufacturer",
    columns: [
        {
            type: "id",
            name: "id",
            headerName: "ID",
        },
        { type: "text", name: "name", headerName: "Name" },
        { type: "text", name: "address.street", headerName: "Address Street" },
        { type: "number", name: "address.streetNumber", headerName: "Address Street Number" },
        { type: "text", name: "address.zip", headerName: "Address Zip" },
        {
            type: "text",
            name: "address.alternativeAddress.street",
            headerName: "Alt-Address Street",
            headerInfoTooltip: "Street of alternative address",
        },
        {
            type: "number",
            name: "address.alternativeAddress.streetNumber",
            headerName: "Alt-Address Street Number",
            headerInfoTooltip: "Street number of alternative address",
        },
        { type: "text", name: "address.alternativeAddress.zip", headerName: "Alt-Address Zip", headerInfoTooltip: "Zip of alternative address" },
        { type: "text", name: "addressAsEmbeddable.street", headerName: "Address As Embeddable Street" },
        { type: "number", name: "addressAsEmbeddable.streetNumber", headerName: "Address As Embeddable Street Number" },
        { type: "text", name: "addressAsEmbeddable.zip", headerName: "Address As Embeddable Zip" },
        { type: "text", name: "addressAsEmbeddable.alternativeAddress.street", headerName: "Address As Embeddable Alternative Address Street" },
        {
            type: "number",
            name: "addressAsEmbeddable.alternativeAddress.streetNumber",
            headerName: "Address As Embeddable Alternative Address Street Number",
        },
        { type: "text", name: "addressAsEmbeddable.alternativeAddress.zip", headerName: "Address As Embeddable Alternative Address Zip" },
    ],
});
