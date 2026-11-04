import { gql, useApolloClient } from "@apollo/client";
import { Box } from "@mui/material";

import type { Manufacturer, Product } from "../../../.storybook/mocks/handlers";
import { FinalForm } from "../../FinalForm";
import { AsyncSelectField } from "../../form/fields/AsyncSelectField";
import { OnChangeField } from "../../form/helpers/OnChangeField";

interface FormValues {
    manufacturer?: Manufacturer;
    product?: Product;
}

export default {
    title: "components/form",
};

export const DependentAsyncSelects = function () {
    const client = useApolloClient();

    return (
        <Box maxWidth={400}>
            <FinalForm<FormValues>
                mode="add"
                onSubmit={() => {
                    // Noop
                }}
            >
                {({ values, form }) => (
                    <>
                        <AsyncSelectField
                            name="manufacturer"
                            loadOptions={async () => {
                                const { data } = await client.query<{ manufacturers: Manufacturer[] }>({
                                    query: gql`
                                        query Manufacturers {
                                            manufacturers {
                                                id
                                                name
                                            }
                                        }
                                    `,
                                });

                                return data.manufacturers;
                            }}
                            getOptionLabel={(option) => option.name}
                            label="Manufacturer"
                            fullWidth
                        />
                        <AsyncSelectField
                            name="product"
                            loadOptions={async () => {
                                const { data } = await client.query<{ products: Product[] }>({
                                    query: gql`
                                        query Products($manufacturer: ID) {
                                            products(manufacturer: $manufacturer) {
                                                id
                                                name
                                            }
                                        }
                                    `,
                                    variables: { manufacturer: values.manufacturer?.id },
                                });

                                return data.products;
                            }}
                            getOptionLabel={(option) => option.name}
                            label="Product"
                            fullWidth
                            disabled={!values.manufacturer}
                        />
                        <OnChangeField name="manufacturer">
                            {() => {
                                form.change("product", undefined);
                            }}
                        </OnChangeField>
                    </>
                )}
            </FinalForm>
        </Box>
    );
};

DependentAsyncSelects.storyName = "Dependent async selects";
