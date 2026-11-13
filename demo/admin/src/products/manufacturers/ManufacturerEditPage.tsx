import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict } from "@dextinity/cms-admin";
import { Icon, KeyValueList, Link, Panel } from "@dextinity/ui";
import { InputField, NumberField, SelectField, SwitchField } from "@dextinity/ui-react-final-form";
import type { GQLAddressInput, GQLProductType } from "@src/graphql.generated";
import { EntityEditPage, EntityEditPageStatus } from "@src/products/common/EntityEditPage";
import { getProductTypeLabel, productTypes } from "@src/products/ui/productLabels";
import { useMemo } from "react";
import { useField } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";

import { createManufacturerMutation, manufacturerEditQuery, updateManufacturerMutation } from "./ManufacturerEditPage.gql";
import type {
    GQLManufacturersUiCreateMutation,
    GQLManufacturersUiCreateMutationVariables,
    GQLManufacturersUiEditFragment,
    GQLManufacturersUiEditQuery,
    GQLManufacturersUiEditQueryVariables,
    GQLManufacturersUiUpdateMutation,
    GQLManufacturersUiUpdateMutationVariables,
} from "./ManufacturerEditPage.gql.generated";
import styles from "./ManufacturerEditPage.module.css";

interface AddressValues {
    street: string;
    streetNumber: number | null;
    zip: string;
    country: string;
}

interface ManufacturerFormValues {
    name: string;
    productType: GQLProductType | null;
    address: AddressValues;
    hasAlternativeAddress: boolean;
    alternativeAddress: AddressValues;
    addressAsEmbeddable: AddressValues;
    alternativeAddressAsEmbeddable: AddressValues;
}

const emptyAddress: AddressValues = { street: "", streetNumber: null, zip: "", country: "" };
const noProductTypeValue = "any";

function toAddressValues(address: AddressValues | null | undefined): AddressValues {
    return address ? { street: address.street, streetNumber: address.streetNumber, zip: address.zip, country: address.country } : emptyAddress;
}

function toAddressInput(address: AddressValues): Omit<GQLAddressInput, "alternativeAddress"> {
    return { street: address.street.trim(), streetNumber: address.streetNumber, zip: address.zip.trim(), country: address.country.trim() };
}

function toFormValues(manufacturer?: GQLManufacturersUiEditFragment): ManufacturerFormValues {
    return {
        name: manufacturer?.name ?? "",
        productType: manufacturer?.productType ?? null,
        address: toAddressValues(manufacturer?.address),
        hasAlternativeAddress: manufacturer?.address?.alternativeAddress != null,
        alternativeAddress: toAddressValues(manufacturer?.address?.alternativeAddress),
        addressAsEmbeddable: toAddressValues(manufacturer?.addressAsEmbeddable),
        alternativeAddressAsEmbeddable: toAddressValues(manufacturer?.addressAsEmbeddable.alternativeAddress),
    };
}

function toManufacturerInput(values: ManufacturerFormValues) {
    return {
        name: values.name.trim(),
        productType: values.productType,
        address: {
            ...toAddressInput(values.address),
            alternativeAddress: values.hasAlternativeAddress ? toAddressInput(values.alternativeAddress) : null,
        },
        addressAsEmbeddable: {
            ...toAddressInput(values.addressAsEmbeddable),
            alternativeAddress: toAddressInput(values.alternativeAddressAsEmbeddable),
        },
    };
}

interface ManufacturerEditPageProps {
    listUrl: string;
    pageUrl: string;
    getEditUrl: (id: string) => string;
    id?: string;
}

export function ManufacturerEditPage({ listUrl, pageUrl, getEditUrl, id }: ManufacturerEditPageProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { data, error, loading } = useQuery<GQLManufacturersUiEditQuery, GQLManufacturersUiEditQueryVariables>(manufacturerEditQuery, {
        variables: { id: id ?? "" },
        skip: id === undefined,
        context: LocalErrorScopeApolloContext,
    });
    const manufacturer = data?.manufacturer;
    const initialValues = useMemo(() => toFormValues(manufacturer), [manufacturer]);
    const listLabel = intl.formatMessage({ id: "uiDemo.manufacturers.pageTitle", defaultMessage: "Manufacturers" });

    if (id !== undefined && !manufacturer) {
        return <EntityEditPageStatus listUrl={listUrl} listLabel={listLabel} loadError={loading ? undefined : (error?.message ?? "")} />;
    }

    const requiredMessage = intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" });

    return (
        <EntityEditPage<ManufacturerFormValues>
            listUrl={listUrl}
            listLabel={listLabel}
            pageUrl={pageUrl}
            title={manufacturer?.name ?? intl.formatMessage({ id: "uiDemo.manufacturers.newTitle", defaultMessage: "New manufacturer" })}
            subtitle={manufacturer?.address ? `${manufacturer.address.zip} · ${manufacturer.address.country}` : undefined}
            initialValues={initialValues}
            isNew={manufacturer === undefined}
            savedAt={manufacturer ? new Date(manufacturer.updatedAt) : undefined}
            getEditUrl={getEditUrl}
            hasSaveConflict={
                manufacturer
                    ? async () => resolveHasSaveConflict(manufacturer.updatedAt, await queryUpdatedAt(client, "manufacturer", manufacturer.id))
                    : undefined
            }
            save={async (values) => {
                const input = toManufacturerInput(values);
                if (manufacturer) {
                    await client.mutate<GQLManufacturersUiUpdateMutation, GQLManufacturersUiUpdateMutationVariables>({
                        mutation: updateManufacturerMutation,
                        variables: { id: manufacturer.id, input },
                        refetchQueries: ["ManufacturersUiList", "ManufacturersUiCountries"],
                        context: LocalErrorScopeApolloContext,
                    });
                    return {};
                }
                const { data: created } = await client.mutate<GQLManufacturersUiCreateMutation, GQLManufacturersUiCreateMutationVariables>({
                    mutation: createManufacturerMutation,
                    variables: { input },
                    refetchQueries: ["ManufacturersUiList", "ManufacturersUiCountries"],
                    context: LocalErrorScopeApolloContext,
                });
                return { createdId: created?.createManufacturer.id };
            }}
            asideLabel={intl.formatMessage({ id: "uiDemo.manufacturers.location", defaultMessage: "Location" })}
            aside={
                <div className={styles.aside}>
                    <Panel
                        title={intl.formatMessage({ id: "uiDemo.manufacturers.location", defaultMessage: "Location" })}
                        description={intl.formatMessage({
                            id: "uiDemo.manufacturers.locationReadOnly",
                            defaultMessage: "Read-only: the API doesn't accept coordinates yet.",
                        })}
                    >
                        <Coordinates coordinates={manufacturer?.coordinates ?? null} />
                    </Panel>
                    {manufacturer && (
                        <Panel>
                            <KeyValueList
                                items={[
                                    {
                                        key: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
                                        value: <FormattedDate value={manufacturer.updatedAt} dateStyle="medium" timeStyle="short" />,
                                    },
                                ]}
                            />
                        </Panel>
                    )}
                </div>
            }
        >
            <Panel>
                <div className={styles.sections}>
                    <section className={styles.section}>
                        <div className={styles.sectionHead}>
                            <h3>{intl.formatMessage({ id: "uiDemo.manufacturers.basics", defaultMessage: "Basics" })}</h3>
                        </div>
                        <div className={styles.fields}>
                            <InputField
                                name="name"
                                label={intl.formatMessage({ id: "uiDemo.manufacturers.name", defaultMessage: "Name" })}
                                required
                                requiredMessage={requiredMessage}
                            />
                            <SelectField<false, string, GQLProductType | null>
                                name="productType"
                                label={intl.formatMessage({ id: "uiDemo.manufacturers.productType", defaultMessage: "Product type" })}
                                format={(productType) => productType ?? noProductTypeValue}
                                parse={(productType) =>
                                    productType === noProductTypeValue || productType == null ? null : (productType as GQLProductType)
                                }
                                options={[
                                    {
                                        value: noProductTypeValue,
                                        label: intl.formatMessage({ id: "uiDemo.manufacturers.noProductType", defaultMessage: "Any" }),
                                    },
                                    ...productTypes.map((productType) => ({ value: productType, label: getProductTypeLabel(intl, productType) })),
                                ]}
                            />
                        </div>
                    </section>
                    <AddressSection
                        name="address"
                        title={intl.formatMessage({ id: "uiDemo.manufacturers.address", defaultMessage: "Address" })}
                        description={intl.formatMessage({ id: "uiDemo.manufacturers.addressDescription", defaultMessage: "The main address." })}
                    />
                    <section className={styles.section}>
                        <SwitchField
                            name="hasAlternativeAddress"
                            description={intl.formatMessage({
                                id: "uiDemo.manufacturers.alternativeAddressDescription",
                                defaultMessage: "For example a warehouse that ships the products.",
                            })}
                        >
                            {intl.formatMessage({ id: "uiDemo.manufacturers.useAlternativeAddress", defaultMessage: "Use an alternative address" })}
                        </SwitchField>
                        <AlternativeAddressFields />
                    </section>
                    <AddressSection
                        name="addressAsEmbeddable"
                        title={intl.formatMessage({ id: "uiDemo.manufacturers.addressAsEmbeddable", defaultMessage: "Address as embeddable" })}
                        description={intl.formatMessage({
                            id: "uiDemo.manufacturers.addressAsEmbeddableDescription",
                            defaultMessage: "The same address stored as an embeddable, which the product filters use.",
                        })}
                    />
                    <AddressSection
                        name="alternativeAddressAsEmbeddable"
                        title={intl.formatMessage({
                            id: "uiDemo.manufacturers.alternativeAddressAsEmbeddable",
                            defaultMessage: "Alternative address as embeddable",
                        })}
                    />
                </div>
            </Panel>
        </EntityEditPage>
    );
}

function AlternativeAddressFields() {
    const {
        input: { value: hasAlternativeAddress },
    } = useField<boolean>("hasAlternativeAddress", { subscription: { value: true } });
    return hasAlternativeAddress ? <AddressFields name="alternativeAddress" /> : null;
}

interface AddressSectionProps {
    name: string;
    title: string;
    description?: string;
}

function AddressSection({ name, title, description }: AddressSectionProps) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHead}>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
            </div>
            <AddressFields name={name} />
        </section>
    );
}

function AddressFields({ name }: { name: string }) {
    const intl = useIntl();
    const requiredMessage = intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" });
    return (
        <div className={styles.addressFields}>
            <InputField
                className={styles.street}
                name={`${name}.street`}
                label={intl.formatMessage({ id: "uiDemo.manufacturers.street", defaultMessage: "Street" })}
                required
                requiredMessage={requiredMessage}
            />
            <NumberField
                name={`${name}.streetNumber`}
                label={intl.formatMessage({ id: "uiDemo.manufacturers.streetNumber", defaultMessage: "Number" })}
                min={0}
                decimals={0}
                steppers={false}
                format={{ useGrouping: false }}
                locale={intl.locale}
            />
            <InputField
                name={`${name}.zip`}
                label={intl.formatMessage({ id: "uiDemo.manufacturers.zip", defaultMessage: "ZIP code" })}
                required
                requiredMessage={requiredMessage}
            />
            <InputField
                className={styles.country}
                name={`${name}.country`}
                label={intl.formatMessage({ id: "uiDemo.manufacturers.country", defaultMessage: "Country" })}
                required
                requiredMessage={requiredMessage}
            />
        </div>
    );
}

function Coordinates({ coordinates }: { coordinates: GQLManufacturersUiEditFragment["coordinates"] }) {
    const intl = useIntl();
    const formatCoordinate = (value: number) => intl.formatNumber(value, { maximumFractionDigits: 6 });
    return (
        <div className={styles.coordinates}>
            <KeyValueList
                items={[
                    {
                        key: intl.formatMessage({ id: "uiDemo.manufacturers.latitude", defaultMessage: "Latitude" }),
                        value: coordinates ? formatCoordinate(coordinates.latitude) : "–",
                    },
                    {
                        key: intl.formatMessage({ id: "uiDemo.manufacturers.longitude", defaultMessage: "Longitude" }),
                        value: coordinates ? formatCoordinate(coordinates.longitude) : "–",
                    },
                ]}
            />
            {coordinates && (
                <Link
                    href={`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=15/${coordinates.latitude}/${coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Icon name="window" />}
                >
                    {intl.formatMessage({ id: "uiDemo.manufacturers.openMap", defaultMessage: "Show on OpenStreetMap" })}
                </Link>
            )}
        </div>
    );
}
