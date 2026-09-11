import { useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FieldSet,
    filterByFragment,
    FinalForm,
    FinalFormInput,
    type FinalFormSubmitEvent,
    Loading,
    messages,
    SwitchField,
    TextField,
    useFormApiRef,
    useStackSwitchApi,
} from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { Collapse, Divider } from "@mui/material";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { createManufacturerMutation, manufacturerFormFragment, manufacturerQuery, updateManufacturerMutation } from "./ManufacturerForm.gql";
import type {
    GQLCreateManufacturerMutation,
    GQLCreateManufacturerMutationVariables,
    GQLManufacturerFormDetailsHandmadeFragment,
    GQLManufacturerQuery,
    GQLManufacturerQueryVariables,
    GQLUpdateManufacturerMutation,
    GQLUpdateManufacturerMutationVariables,
} from "./ManufacturerForm.gql.generated";

type FormValues = Omit<GQLManufacturerFormDetailsHandmadeFragment, "address" | "addressAsEmbeddable"> & {
    useAlternativeAddress: boolean;
    address:
        | (Omit<NonNullable<GQLManufacturerFormDetailsHandmadeFragment["address"]>, "streetNumber" | "alternativeAddress"> & {
              streetNumber: string | null;
              alternativeAddress:
                  | (Omit<NonNullable<NonNullable<GQLManufacturerFormDetailsHandmadeFragment["address"]>["alternativeAddress"]>, "streetNumber"> & {
                        streetNumber: string | null;
                    })
                  | null;
          })
        | null;
    addressAsEmbeddable: Omit<
        NonNullable<GQLManufacturerFormDetailsHandmadeFragment["addressAsEmbeddable"]>,
        "streetNumber" | "alternativeAddress"
    > & {
        streetNumber: string | null;
        alternativeAddress: Omit<
            NonNullable<NonNullable<GQLManufacturerFormDetailsHandmadeFragment["addressAsEmbeddable"]>["alternativeAddress"]>,
            "streetNumber"
        > & {
            streetNumber: string | null;
        };
    };
};

interface FormProps {
    id?: string;
}

export function ManufacturerForm({ id }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLManufacturerQuery, GQLManufacturerQueryVariables>(
        manufacturerQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = useMemo<Partial<FormValues>>(() => {
        const filteredData = data
            ? filterByFragment<GQLManufacturerFormDetailsHandmadeFragment>(manufacturerFormFragment, data.manufacturer)
            : undefined;
        if (!filteredData) {
            return {};
        }
        return {
            ...filteredData,
            useAlternativeAddress: !!filteredData.address?.alternativeAddress,
            address: filteredData.address
                ? {
                      ...filteredData.address,
                      streetNumber: filteredData.address.streetNumber ? String(filteredData.address.streetNumber) : null,
                      alternativeAddress: filteredData.address.alternativeAddress
                          ? {
                                ...filteredData.address.alternativeAddress,
                                streetNumber: filteredData.address.alternativeAddress.streetNumber
                                    ? String(filteredData.address.alternativeAddress.streetNumber)
                                    : null,
                            }
                          : undefined,
                  }
                : undefined,
            addressAsEmbeddable: {
                ...filteredData.addressAsEmbeddable,
                streetNumber: filteredData.addressAsEmbeddable.streetNumber ? String(filteredData.addressAsEmbeddable.streetNumber) : null,
                alternativeAddress: {
                    ...filteredData.addressAsEmbeddable.alternativeAddress,
                    streetNumber: filteredData.addressAsEmbeddable.alternativeAddress.streetNumber
                        ? String(filteredData.addressAsEmbeddable.alternativeAddress.streetNumber)
                        : null,
                },
            },
        };
    }, [data]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "manufacturer", id);
            return resolveHasSaveConflict(data?.manufacturer.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async ({ useAlternativeAddress, ...formValues }: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }
        const output = {
            ...formValues,
            address: formValues.address
                ? {
                      ...formValues.address,
                      streetNumber: formValues.address?.streetNumber ? parseInt(formValues.address.streetNumber) : null,
                      alternativeAddress:
                          useAlternativeAddress && formValues.address?.alternativeAddress
                              ? {
                                    ...formValues.address.alternativeAddress,
                                    streetNumber: formValues.address?.alternativeAddress.streetNumber
                                        ? parseInt(formValues.address.alternativeAddress.streetNumber)
                                        : null,
                                }
                              : undefined,
                  }
                : undefined,
            addressAsEmbeddable: {
                ...formValues.addressAsEmbeddable,
                streetNumber: formValues.addressAsEmbeddable?.streetNumber ? parseInt(formValues.addressAsEmbeddable.streetNumber) : null,
                alternativeAddress: {
                    ...formValues.addressAsEmbeddable.alternativeAddress,
                    streetNumber: formValues.addressAsEmbeddable?.alternativeAddress.streetNumber
                        ? parseInt(formValues.addressAsEmbeddable.alternativeAddress.streetNumber)
                        : null,
                },
            },
        };
        if (mode === "edit") {
            if (!id) {
                throw new Error();
            }
            await client.mutate<GQLUpdateManufacturerMutation, GQLUpdateManufacturerMutationVariables>({
                mutation: updateManufacturerMutation,
                variables: { id, input: output },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateManufacturerMutation, GQLCreateManufacturerMutationVariables>({
                mutation: createManufacturerMutation,
                variables: { input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createManufacturer.id;
                if (id) {
                    setTimeout(() => {
                        stackSwitchApi.activatePage(`edit`, id);
                    });
                }
            }
        }
    };

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode={mode}
            initialValues={initialValues}
            initialValuesEqual={isEqual} //required to compare block data correctly
            subscription={{}}
        >
            <>
                {saveConflict.dialogs}
                <>
                    <FieldSet>
                        <TextField required fullWidth name="name" label={<FormattedMessage id="manufacturer.name" defaultMessage="Name" />} />
                    </FieldSet>
                    <FieldSet
                        title={<FormattedMessage id="manufacturer.address" defaultMessage="Address" />}
                        supportText={<FormattedMessage id="manufacturer.address.supportText" defaultMessage="The main address" />}
                        collapsible={true}
                        initiallyExpanded={true}
                    >
                        <TextField
                            required
                            fullWidth
                            name="address.street"
                            label={<FormattedMessage id="manufacturer.address.street" defaultMessage="Address Street" />}
                        />
                        <Field
                            fullWidth
                            name="address.streetNumber"
                            component={FinalFormInput}
                            type="number"
                            label={<FormattedMessage id="manufacturer.address.streetNumber" defaultMessage="Address Street Number" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="address.zip"
                            label={<FormattedMessage id="manufacturer.address.zip" defaultMessage="Address Zip" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="address.country"
                            label={<FormattedMessage id="manufacturer.address.country" defaultMessage="Address Country" />}
                        />
                        <Divider sx={{ marginBottom: 5 }} />
                        <SwitchField
                            fullWidth
                            name="useAlternativeAddress"
                            fieldLabel={<FormattedMessage id="manufacturer.address.useAlternativeAddress" defaultMessage="Use alternative address" />}
                            label={(checked) => (checked ? <FormattedMessage {...messages.yes} /> : <FormattedMessage {...messages.no} />)}
                        />
                        <Field name="useAlternativeAddress" subscription={{ value: true }}>
                            {({ input: { value } }) => (
                                <Collapse in={value}>
                                    <>
                                        <TextField
                                            required
                                            fullWidth
                                            name="address.alternativeAddress.street"
                                            label={
                                                <FormattedMessage
                                                    id="manufacturer.address.alternativeAddress.street"
                                                    defaultMessage="Alt-Address Street"
                                                />
                                            }
                                        />
                                        <Field
                                            fullWidth
                                            name="address.alternativeAddress.streetNumber"
                                            component={FinalFormInput}
                                            type="number"
                                            label={
                                                <FormattedMessage
                                                    id="manufacturer.address.alternativeAddress.streetNumber"
                                                    defaultMessage="Alt-Address Street Number"
                                                />
                                            }
                                        />
                                        <TextField
                                            required
                                            fullWidth
                                            name="address.alternativeAddress.zip"
                                            label={
                                                <FormattedMessage id="manufacturer.address.alternativeAddress.zip" defaultMessage="Alt-Address Zip" />
                                            }
                                        />
                                        <TextField
                                            required
                                            fullWidth
                                            name="address.alternativeAddress.country"
                                            label={
                                                <FormattedMessage
                                                    id="manufacturer.address.alternativeAddress.country"
                                                    defaultMessage="Alt-Address Country"
                                                />
                                            }
                                        />
                                    </>
                                </Collapse>
                            )}
                        </Field>
                    </FieldSet>
                    <FieldSet
                        collapsible={false}
                        title={<FormattedMessage id="manufacturer.addressAsEmbeddable.title" defaultMessage="Address as embeddable" />}
                    >
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.street"
                            label={<FormattedMessage id="manufacturer.address.street" defaultMessage="Address Street" />}
                        />
                        <Field
                            fullWidth
                            name="addressAsEmbeddable.streetNumber"
                            component={FinalFormInput}
                            type="number"
                            label={<FormattedMessage id="manufacturer.address.streetNumber" defaultMessage="Address Street Number" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.zip"
                            label={<FormattedMessage id="manufacturer.address.zip" defaultMessage="Address Zip" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.country"
                            label={<FormattedMessage id="manufacturer.address.country" defaultMessage="Address Country" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.alternativeAddress.street"
                            label={<FormattedMessage id="manufacturer.address.alternativeAddress.street" defaultMessage="Alt-Address Street" />}
                        />
                        <Field
                            fullWidth
                            name="addressAsEmbeddable.alternativeAddress.streetNumber"
                            component={FinalFormInput}
                            type="number"
                            label={
                                <FormattedMessage
                                    id="manufacturer.address.alternativeAddress.streetNumber"
                                    defaultMessage="Alt-Address Street Number"
                                />
                            }
                        />
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.alternativeAddress.zip"
                            label={<FormattedMessage id="manufacturer.address.alternativeAddress.zip" defaultMessage="Alt-Address Zip" />}
                        />
                        <TextField
                            required
                            fullWidth
                            name="addressAsEmbeddable.alternativeAddress.country"
                            label={<FormattedMessage id="manufacturer.address.alternativeAddress.country" defaultMessage="Alt-Address Country" />}
                        />
                    </FieldSet>
                </>
            </>
        </FinalForm>
    );
}
