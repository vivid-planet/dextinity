import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    type BlockState,
    createFinalFormBlock,
    DamFileField,
    DamImageBlock,
    type GQLDamFileFieldFileFragment,
    type GQLFinalFormFileUploadDownloadableFragment,
    type GQLFinalFormFileUploadFragment,
    PublicFileUploadField,
    queryUpdatedAt,
    resolveHasSaveConflict,
    RouterTabLink,
} from "@dextinity/cms-admin";
import { Banner, KeyValueList, Panel, StatusIndicator, Tabs, type TabsItem } from "@dextinity/ui";
import {
    ComboboxField,
    DateField,
    DateTimeField,
    InputField,
    NumberField,
    SelectField,
    SwitchField,
    TextareaField,
} from "@dextinity/ui-react-final-form";
import type { GQLProductInput, GQLProductMutationErrorCode, GQLProductStatus, GQLProductType } from "@src/graphql.generated";
import { EntityEditPage, EntityEditPageStatus } from "@src/products/common/EntityEditPage";
import { OnFieldChange } from "@src/products/common/OnFieldChange";
import { useComboboxLabels } from "@src/products/common/useComboboxLabels";
import { deepEqual } from "fast-equals";
import { FORM_ERROR } from "final-form";
import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import { Field, useField, useForm, useFormState } from "react-final-form";
import { FormattedDate, type IntlShape, useIntl } from "react-intl";
import { useLocation } from "react-router";

import {
    createProductMutation,
    manufacturerCountryOptionsQuery,
    manufacturerOptionsQuery,
    productCategoryOptionsQuery,
    productEditQuery,
    productTagOptionsQuery,
    updateProductMutation,
} from "./ProductEditPage.gql";
import type {
    GQLProductsUiCreateMutation,
    GQLProductsUiCreateMutationVariables,
    GQLProductsUiEditCategoryOptionsQuery,
    GQLProductsUiEditCategoryOptionsQueryVariables,
    GQLProductsUiEditFragment,
    GQLProductsUiEditManufacturerCountryOptionsQuery,
    GQLProductsUiEditManufacturerCountryOptionsQueryVariables,
    GQLProductsUiEditManufacturerOptionsQuery,
    GQLProductsUiEditManufacturerOptionsQueryVariables,
    GQLProductsUiEditQuery,
    GQLProductsUiEditQueryVariables,
    GQLProductsUiEditTagOptionsQuery,
    GQLProductsUiEditTagOptionsQueryVariables,
    GQLProductsUiUpdateMutation,
    GQLProductsUiUpdateMutationVariables,
} from "./ProductEditPage.gql.generated";
import styles from "./ProductEditPage.module.css";
import { getProductStatusIndicator, getProductStatusLabel, getProductTypeLabel, productStatuses, productTypes } from "./productLabels";
import { ProductVariantsTab } from "./ProductVariantsTab";

type PublicFileUpload = GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment;

// Codegen types the fragments of `@dextinity/cms-admin` as empty objects
type ProductEdit = Omit<GQLProductsUiEditFragment, "priceList" | "datasheets" | "relatedImages"> & {
    priceList: GQLFinalFormFileUploadDownloadableFragment | null;
    datasheets: GQLFinalFormFileUploadDownloadableFragment[];
    relatedImages: GQLDamFileFieldFileFragment[];
};

interface TitleOption {
    id: string;
    title: string;
}

interface CountryOption {
    id: string;
    label: string;
}

interface ManufacturerOption {
    id: string;
    name: string;
    addressAsEmbeddable: { country: string };
}

interface ProductFormValues {
    title: string;
    slug: string;
    /** Missing once the field is emptied, as React Final Form parses an empty input as `undefined` */
    description?: string;
    status: GQLProductStatus;
    inStock: boolean;
    type: GQLProductType | null;
    additionalTypes: GQLProductType[];
    category: TitleOption | null;
    tags: TitleOption[];
    manufacturerCountry: CountryOption | null;
    manufacturer: ManufacturerOption | null;
    availableSince: string | null;
    lastCheckedAt: string | null;
    image: BlockState<typeof DamImageBlock>;
    priceList: PublicFileUpload | null;
    datasheets: PublicFileUpload[];
    relatedImages: GQLDamFileFieldFileFragment[];
    width: number | null;
    height: number | null;
    depth: number | null;
    price: number | null;
    minPrice: number | null;
    maxPrice: number | null;
}

type ProductTab = "product" | "price" | "variants";

const productTabFields: Array<keyof ProductFormValues> = [
    "title",
    "slug",
    "description",
    "type",
    "additionalTypes",
    "category",
    "tags",
    "manufacturerCountry",
    "manufacturer",
    "availableSince",
    "lastCheckedAt",
    "image",
    "priceList",
    "datasheets",
    "relatedImages",
    "width",
    "height",
    "depth",
];
const priceTabFields: Array<keyof ProductFormValues> = ["price", "minPrice", "maxPrice"];

const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;
const maxUploadSize = 4 * 1024 * 1024;

const FinalFormDamImageBlock = createFinalFormBlock(DamImageBlock);

function toFormValues(product?: ProductEdit): ProductFormValues {
    return {
        title: product?.title ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? undefined,
        status: product?.status ?? "Unpublished",
        inStock: product?.inStock ?? true,
        type: product?.type ?? null,
        additionalTypes: product?.additionalTypes ?? [],
        category: product?.category ?? null,
        tags: product?.tags ?? [],
        manufacturerCountry: product?.manufacturer
            ? { id: product.manufacturer.addressAsEmbeddable.country, label: product.manufacturer.addressAsEmbeddable.country }
            : null,
        manufacturer: product?.manufacturer ?? null,
        availableSince: product?.availableSince ?? null,
        lastCheckedAt: product?.lastCheckedAt ?? null,
        image: product ? DamImageBlock.input2State(product.image) : DamImageBlock.defaultValues(),
        priceList: product?.priceList ?? null,
        datasheets: product?.datasheets ?? [],
        relatedImages: product?.relatedImages ?? [],
        width: product?.dimensions?.width ?? null,
        height: product?.dimensions?.height ?? null,
        depth: product?.dimensions?.depth ?? null,
        price: product?.price ?? null,
        minPrice: product?.priceRange?.min ?? null,
        maxPrice: product?.priceRange?.max ?? null,
    };
}

function toProductInput(values: ProductFormValues, type: GQLProductType) {
    const description = values.description?.trim() ?? "";
    return {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: description === "" ? null : description,
        status: values.status,
        inStock: values.inStock,
        type,
        additionalTypes: values.additionalTypes,
        category: values.category?.id ?? null,
        tags: values.tags.map((tag) => tag.id),
        manufacturer: values.manufacturer?.id ?? null,
        availableSince: values.availableSince,
        lastCheckedAt: values.lastCheckedAt,
        image: DamImageBlock.state2Output(values.image),
        priceList: values.priceList?.id ?? null,
        datasheets: values.datasheets.map((file) => file.id),
        relatedImages: values.relatedImages.map((file) => file.id),
        dimensions:
            values.width != null && values.height != null && values.depth != null
                ? { width: values.width, height: values.height, depth: values.depth }
                : null,
        price: values.price,
        priceRange: values.minPrice != null && values.maxPrice != null ? { min: values.minPrice, max: values.maxPrice } : null,
    } satisfies Partial<GQLProductInput>;
}

function getCreateErrorMessage(intl: IntlShape, code: GQLProductMutationErrorCode) {
    switch (code) {
        case "titleTooShort":
            return intl.formatMessage({
                id: "uiDemo.productEdit.error.titleTooShort",
                defaultMessage: "Enter at least 3 characters for a new product, except for “foo”",
            });
    }
}

interface ProductEditPageProps {
    listUrl: string;
    pageUrl: string;
    getEditUrl: (id: string) => string;
    id?: string;
}

export function ProductEditPage({ listUrl, pageUrl, getEditUrl, id }: ProductEditPageProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const location = useLocation();
    const { data, error, loading } = useQuery<GQLProductsUiEditQuery, GQLProductsUiEditQueryVariables>(productEditQuery, {
        variables: { id: id ?? "" },
        skip: id === undefined,
        context: LocalErrorScopeApolloContext,
    });
    const product = data?.product as ProductEdit | undefined;
    const initialValues = useMemo(() => toFormValues(product), [product]);
    const listLabel = intl.formatMessage({ id: "uiDemo.products.pageTitle", defaultMessage: "Products" });

    if (id !== undefined && !product) {
        return <EntityEditPageStatus listUrl={listUrl} listLabel={listLabel} loadError={loading ? undefined : (error?.message ?? "")} />;
    }

    const selectedTab: ProductTab = location.pathname.startsWith(`${pageUrl}/price`)
        ? "price"
        : location.pathname.startsWith(`${pageUrl}/variants`) && product
          ? "variants"
          : "product";

    const save = async (values: ProductFormValues) => {
        if (values.type === null) {
            return { errors: { type: intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" }) } };
        }
        const input = toProductInput(values, values.type);
        if (product) {
            await client.mutate<GQLProductsUiUpdateMutation, GQLProductsUiUpdateMutationVariables>({
                mutation: updateProductMutation,
                variables: { id: product.id, input },
                refetchQueries: ["ProductsUiList"],
                context: LocalErrorScopeApolloContext,
            });
            return {};
        }
        const { data: created } = await client.mutate<GQLProductsUiCreateMutation, GQLProductsUiCreateMutationVariables>({
            mutation: createProductMutation,
            variables: { input: { ...input, articleNumbers: [], discounts: [], statistics: { views: 0 } } },
            refetchQueries: ["ProductsUiList"],
            context: LocalErrorScopeApolloContext,
        });
        const createErrors = created?.createProduct.errors ?? [];
        if (createErrors.length > 0) {
            return {
                errors: Object.fromEntries(
                    createErrors.map((createError) => [createError.field ?? FORM_ERROR, getCreateErrorMessage(intl, createError.code)]),
                ),
            };
        }
        return { createdId: created?.createProduct.product?.id };
    };

    return (
        <EntityEditPage<ProductFormValues>
            listUrl={listUrl}
            listLabel={listLabel}
            pageUrl={pageUrl}
            isPathOfPage={(pathname) => [pageUrl, `${pageUrl}/price`, `${pageUrl}/variants`].includes(pathname.replace(/\/$/, ""))}
            title={product?.title ?? intl.formatMessage({ id: "uiDemo.productEdit.newTitle", defaultMessage: "New product" })}
            subtitle={
                product ? (
                    <span className={styles.metaLine}>
                        <StatusIndicator status={getProductStatusIndicator(product.status)}>
                            {getProductStatusLabel(intl, product.status)}
                        </StatusIndicator>
                        <span className={styles.mono}>{`/${product.slug}`}</span>
                    </span>
                ) : undefined
            }
            initialValues={initialValues}
            isNew={product === undefined}
            savedAt={product ? new Date(product.updatedAt) : undefined}
            getEditUrl={getEditUrl}
            hasSaveConflict={
                product ? async () => resolveHasSaveConflict(product.updatedAt, await queryUpdatedAt(client, "product", product.id)) : undefined
            }
            save={save}
            beforeContent={<ProductTabs pageUrl={pageUrl} selectedTab={selectedTab} hasVariants={product !== undefined} />}
            asideLabel={intl.formatMessage({ id: "uiDemo.productEdit.publishing", defaultMessage: "Publishing" })}
            aside={<ProductAside product={product} />}
        >
            <div hidden={selectedTab !== "product"}>
                <ProductFields />
            </div>
            <div hidden={selectedTab !== "price"}>
                <PriceFields />
            </div>
            {product && selectedTab === "variants" && <ProductVariantsTab productId={product.id} variantsUrl={`${pageUrl}/variants`} />}
        </EntityEditPage>
    );
}

interface ProductTabsProps {
    pageUrl: string;
    selectedTab: ProductTab;
    hasVariants: boolean;
}

function ProductTabs({ pageUrl, selectedTab, hasVariants }: ProductTabsProps) {
    const intl = useIntl();
    const { errors, submitFailed } = useFormState({ subscription: { errors: true, submitFailed: true } });
    const hasErrorIn = (fields: Array<keyof ProductFormValues>) => submitFailed && fields.some((field) => errors?.[field] !== undefined);

    const items: Array<TabsItem<ProductTab>> = [
        {
            value: "product",
            label: intl.formatMessage({ id: "uiDemo.productEdit.tab.product", defaultMessage: "Product" }),
            href: pageUrl,
            tone: hasErrorIn(productTabFields) ? "error" : "default",
        },
        {
            value: "price",
            label: intl.formatMessage({ id: "uiDemo.productEdit.tab.price", defaultMessage: "Price" }),
            href: `${pageUrl}/price`,
            tone: hasErrorIn(priceTabFields) ? "error" : "default",
        },
        {
            value: "variants",
            label: intl.formatMessage({ id: "uiDemo.productEdit.tab.variants", defaultMessage: "Variants" }),
            href: `${pageUrl}/variants`,
            disabled: !hasVariants,
        },
    ];

    return (
        <Tabs<ProductTab>
            aria-label={intl.formatMessage({ id: "uiDemo.productEdit.tabs", defaultMessage: "Product" })}
            value={selectedTab}
            onChange={() => {
                // The tabs are router links; the route decides the selected tab
            }}
            items={items}
            labels={{ error: intl.formatMessage({ id: "uiDemo.productEdit.tabError", defaultMessage: "Contains errors" }) }}
            slots={{ tab: RouterTabLink }}
        />
    );
}

function ProductAside({ product }: { product?: ProductEdit }) {
    const intl = useIntl();
    return (
        <div className={styles.aside}>
            <Panel title={intl.formatMessage({ id: "uiDemo.productEdit.publishing", defaultMessage: "Publishing" })}>
                <div className={styles.asideBody}>
                    <SelectField<false, GQLProductStatus, GQLProductStatus>
                        name="status"
                        label={intl.formatMessage({ id: "uiDemo.products.status", defaultMessage: "Status" })}
                        required
                        options={productStatuses.map((status) => ({ value: status, label: getProductStatusLabel(intl, status) }))}
                    />
                    <SwitchField name="inStock">{intl.formatMessage({ id: "uiDemo.products.inStock", defaultMessage: "In stock" })}</SwitchField>
                </div>
            </Panel>
            {product && (
                <Panel>
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({ id: "uiDemo.products.variants", defaultMessage: "Variants" }),
                                value: intl.formatNumber(product.variants.length),
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.createdAt", defaultMessage: "Created" }),
                                value: <FormattedDate value={product.createdAt} dateStyle="medium" timeStyle="short" />,
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
                                value: <FormattedDate value={product.updatedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                </Panel>
            )}
        </div>
    );
}

interface FormSectionProps {
    title: string;
    description?: ReactNode;
}

function FormSection({ title, description, children }: PropsWithChildren<FormSectionProps>) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHead}>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
            </div>
            {children}
        </section>
    );
}

function ProductFields() {
    const intl = useIntl();
    const requiredMessage = intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" });
    const typeOptions = productTypes.map((productType) => ({ value: productType, label: getProductTypeLabel(intl, productType) }));

    return (
        <Panel>
            <div className={styles.sections}>
                <FormSection title={intl.formatMessage({ id: "uiDemo.productEdit.basics", defaultMessage: "Basics" })}>
                    <div className={styles.fields}>
                        <InputField
                            className={styles.fullWidth}
                            name="title"
                            label={intl.formatMessage({ id: "uiDemo.products.title", defaultMessage: "Title" })}
                            required
                            requiredMessage={requiredMessage}
                        />
                        <InputField
                            className={styles.fullWidth}
                            name="slug"
                            label={intl.formatMessage({ id: "uiDemo.products.slug", defaultMessage: "Slug" })}
                            prefix="/"
                            required
                            requiredMessage={requiredMessage}
                            validate={(slug?: string) =>
                                slug && !slugPattern.test(slug.trim())
                                    ? intl.formatMessage({
                                          id: "uiDemo.productEdit.slugInvalid",
                                          defaultMessage: "Start with a letter or digit, then use letters, digits, “-” and “_” only",
                                      })
                                    : undefined
                            }
                        />
                        <TextareaField
                            className={styles.fullWidth}
                            name="description"
                            label={intl.formatMessage({ id: "uiDemo.products.description", defaultMessage: "Description" })}
                            rows={4}
                        />
                    </div>
                </FormSection>
                <FormSection title={intl.formatMessage({ id: "uiDemo.productEdit.classification", defaultMessage: "Classification" })}>
                    <div className={styles.fields}>
                        <SelectField<false, GQLProductType, GQLProductType | null>
                            name="type"
                            label={intl.formatMessage({ id: "uiDemo.products.type", defaultMessage: "Type" })}
                            placeholder={intl.formatMessage({ id: "uiDemo.productEdit.chooseType", defaultMessage: "Choose a type" })}
                            required
                            requiredMessage={requiredMessage}
                            options={typeOptions}
                        />
                        <SelectField<true, GQLProductType>
                            name="additionalTypes"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.additionalTypes", defaultMessage: "Additional types" })}
                            placeholder={intl.formatMessage({ id: "uiDemo.productEdit.noAdditionalTypes", defaultMessage: "None" })}
                            multiple
                            options={typeOptions}
                        />
                        <CategoryField />
                        <TagsField />
                    </div>
                </FormSection>
                <FormSection
                    title={intl.formatMessage({ id: "uiDemo.products.manufacturer", defaultMessage: "Manufacturer" })}
                    description={intl.formatMessage({
                        id: "uiDemo.productEdit.manufacturerDescription",
                        defaultMessage: "Choose the country first to narrow down the manufacturers.",
                    })}
                >
                    <ManufacturerFields />
                </FormSection>
                <FormSection title={intl.formatMessage({ id: "uiDemo.productEdit.availability", defaultMessage: "Availability" })}>
                    <div className={styles.fields}>
                        <DateField
                            name="availableSince"
                            label={intl.formatMessage({ id: "uiDemo.products.availableSince", defaultMessage: "Available since" })}
                            locale={intl.locale}
                            required
                            requiredMessage={requiredMessage}
                        />
                        <DateTimeField
                            name="lastCheckedAt"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.lastCheckedAt", defaultMessage: "Last checked at" })}
                            locale={intl.locale}
                        />
                        <FutureAvailabilityBanner />
                    </div>
                </FormSection>
                <FormSection title={intl.formatMessage({ id: "uiDemo.products.image", defaultMessage: "Image" })}>
                    <div className={styles.block}>
                        <Field name="image" component={FinalFormDamImageBlock} isEqual={deepEqual} />
                    </div>
                </FormSection>
                <FormSection title={intl.formatMessage({ id: "uiDemo.productEdit.files", defaultMessage: "Files" })}>
                    <div className={styles.fields}>
                        <PublicFileUploadField
                            name="priceList"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.priceList", defaultMessage: "Price list" })}
                            maxSize={maxUploadSize}
                            hint={intl.formatMessage({ id: "uiDemo.productEdit.uploadHint", defaultMessage: "Up to 4 MB" })}
                        />
                        <PublicFileUploadField
                            name="datasheets"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.datasheets", defaultMessage: "Datasheets" })}
                            multiple
                            maxSize={maxUploadSize}
                            hint={intl.formatMessage({ id: "uiDemo.productEdit.uploadHint", defaultMessage: "Up to 4 MB" })}
                        />
                        <DamFileField
                            className={styles.fullWidth}
                            name="relatedImages"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.relatedImages", defaultMessage: "Related images" })}
                            placeholder={intl.formatMessage({
                                id: "uiDemo.productEdit.chooseRelatedImages",
                                defaultMessage: "Choose related images",
                            })}
                            allowedMimetypes={["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]}
                            multiple
                        />
                    </div>
                </FormSection>
                <FormSection
                    title={intl.formatMessage({ id: "uiDemo.productEdit.dimensions", defaultMessage: "Dimensions" })}
                    description={intl.formatMessage({
                        id: "uiDemo.productEdit.dimensionsDescription",
                        defaultMessage: "In centimeters. Enter all three or none.",
                    })}
                >
                    <div className={styles.threeColumns}>
                        {(["width", "height", "depth"] as const).map((dimension) => (
                            <NumberField
                                key={dimension}
                                name={dimension}
                                label={getDimensionLabel(intl, dimension)}
                                min={0}
                                decimals={2}
                                locale={intl.locale}
                                suffix="cm"
                                validate={(value, values) => {
                                    const { width, height, depth } = values as ProductFormValues;
                                    const filledCount = [width, height, depth].filter((size) => size != null).length;
                                    return value == null && filledCount > 0
                                        ? intl.formatMessage({
                                              id: "uiDemo.productEdit.dimensionsIncomplete",
                                              defaultMessage: "Enter all three dimensions or none",
                                          })
                                        : undefined;
                                }}
                            />
                        ))}
                    </div>
                </FormSection>
            </div>
        </Panel>
    );
}

function getDimensionLabel(intl: IntlShape, dimension: "width" | "height" | "depth") {
    switch (dimension) {
        case "width":
            return intl.formatMessage({ id: "uiDemo.productEdit.width", defaultMessage: "Width" });
        case "height":
            return intl.formatMessage({ id: "uiDemo.productEdit.height", defaultMessage: "Height" });
        case "depth":
            return intl.formatMessage({ id: "uiDemo.productEdit.depth", defaultMessage: "Depth" });
    }
}

function FutureAvailabilityBanner() {
    const intl = useIntl();
    const {
        input: { value: availableSince },
    } = useField<string | null>("availableSince", { subscription: { value: true } });
    const today = new Date().toISOString().slice(0, 10);
    if (!availableSince || availableSince <= today) {
        return null;
    }
    return (
        <Banner tone="warning" className={styles.fullWidth}>
            {intl.formatMessage({
                id: "uiDemo.productEdit.futureAvailability",
                defaultMessage: "The product isn't visible to the public until this day.",
            })}
        </Banner>
    );
}

function CategoryField() {
    const intl = useIntl();
    const client = useApolloClient();
    const comboboxLabels = useComboboxLabels();
    return (
        <ComboboxField<TitleOption>
            name="category"
            label={intl.formatMessage({ id: "uiDemo.products.category", defaultMessage: "Category" })}
            placeholder={intl.formatMessage({ id: "uiDemo.productEdit.chooseCategory", defaultMessage: "Choose a category" })}
            getOptionLabel={(category) => category.title}
            getOptionKey={(category) => category.id}
            labels={comboboxLabels}
            loadOptions={async (search, { signal }) => {
                const { data } = await client.query<GQLProductsUiEditCategoryOptionsQuery, GQLProductsUiEditCategoryOptionsQueryVariables>({
                    query: productCategoryOptionsQuery,
                    variables: { search: search || undefined },
                    context: { fetchOptions: { signal } },
                });
                return data.productCategories.nodes;
            }}
        />
    );
}

function TagsField() {
    const intl = useIntl();
    const client = useApolloClient();
    const comboboxLabels = useComboboxLabels();
    return (
        <ComboboxField<TitleOption, true>
            name="tags"
            label={intl.formatMessage({ id: "uiDemo.products.tags", defaultMessage: "Tags" })}
            placeholder={intl.formatMessage({ id: "uiDemo.productEdit.chooseTags", defaultMessage: "Choose tags" })}
            multiple
            getOptionLabel={(tag) => tag.title}
            getOptionKey={(tag) => tag.id}
            labels={comboboxLabels}
            loadOptions={async (search, { signal }) => {
                const { data } = await client.query<GQLProductsUiEditTagOptionsQuery, GQLProductsUiEditTagOptionsQueryVariables>({
                    query: productTagOptionsQuery,
                    variables: { search: search || undefined },
                    context: { fetchOptions: { signal } },
                });
                return data.productTags.nodes;
            }}
        />
    );
}

function ManufacturerFields() {
    const intl = useIntl();
    const client = useApolloClient();
    const form = useForm<ProductFormValues>();
    const comboboxLabels = useComboboxLabels();
    const {
        input: { value: country },
    } = useField<CountryOption | null>("manufacturerCountry", { subscription: { value: true } });

    return (
        <div className={styles.fields}>
            <ComboboxField<CountryOption>
                name="manufacturerCountry"
                label={intl.formatMessage({ id: "uiDemo.productEdit.manufacturerCountry", defaultMessage: "Country" })}
                placeholder={intl.formatMessage({ id: "uiDemo.productEdit.chooseCountry", defaultMessage: "Choose a country" })}
                getOptionLabel={(option) => option.label}
                getOptionKey={(option) => option.id}
                labels={comboboxLabels}
                loadOptions={async (search, { signal }) => {
                    const { data } = await client.query<
                        GQLProductsUiEditManufacturerCountryOptionsQuery,
                        GQLProductsUiEditManufacturerCountryOptionsQueryVariables
                    >({
                        query: manufacturerCountryOptionsQuery,
                        variables: { search: search || undefined },
                        context: { fetchOptions: { signal } },
                    });
                    return data.manufacturerCountries.nodes;
                }}
            />
            <OnFieldChange<CountryOption | null>
                name="manufacturerCountry"
                onChange={(nextCountry) => {
                    const manufacturer = form.getState().values.manufacturer;
                    if (manufacturer && manufacturer.addressAsEmbeddable.country !== nextCountry?.id) {
                        form.change("manufacturer", null);
                    }
                }}
            />
            <ComboboxField<ManufacturerOption>
                key={country ? country.id : "none"}
                name="manufacturer"
                label={intl.formatMessage({ id: "uiDemo.products.manufacturer", defaultMessage: "Manufacturer" })}
                placeholder={
                    country
                        ? intl.formatMessage({ id: "uiDemo.productEdit.chooseManufacturer", defaultMessage: "Choose a manufacturer" })
                        : intl.formatMessage({ id: "uiDemo.productEdit.chooseCountryFirst", defaultMessage: "Choose a country first" })
                }
                disabled={!country}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                labels={comboboxLabels}
                loadOptions={async (search, { signal }) => {
                    const { data } = await client.query<
                        GQLProductsUiEditManufacturerOptionsQuery,
                        GQLProductsUiEditManufacturerOptionsQueryVariables
                    >({
                        query: manufacturerOptionsQuery,
                        variables: {
                            search: search || undefined,
                            filter: country ? { addressAsEmbeddable_country: { equal: country.id } } : undefined,
                        },
                        context: { fetchOptions: { signal } },
                    });
                    return data.manufacturers.nodes;
                }}
            />
        </div>
    );
}

function PriceFields() {
    const intl = useIntl();
    const currencyFormat: Intl.NumberFormatOptions = { style: "currency", currency: "EUR" };
    const bothOrNeither = (value: number | null, otherValue: number | null) =>
        value == null && otherValue != null
            ? intl.formatMessage({ id: "uiDemo.productEdit.priceRangeIncomplete", defaultMessage: "Enter both limits or none" })
            : undefined;

    return (
        <Panel>
            <div className={styles.sections}>
                <FormSection title={intl.formatMessage({ id: "uiDemo.products.price", defaultMessage: "Price" })}>
                    <div className={styles.fields}>
                        <NumberField
                            name="price"
                            label={intl.formatMessage({ id: "uiDemo.products.price", defaultMessage: "Price" })}
                            min={0}
                            decimals={2}
                            format={currencyFormat}
                            locale={intl.locale}
                            helperText={intl.formatMessage({
                                id: "uiDemo.productEdit.priceHelper",
                                defaultMessage: "Leave empty for “price on request”.",
                            })}
                        />
                    </div>
                </FormSection>
                <FormSection
                    title={intl.formatMessage({ id: "uiDemo.productEdit.priceRange", defaultMessage: "Price range" })}
                    description={intl.formatMessage({
                        id: "uiDemo.productEdit.priceRangeDescription",
                        defaultMessage: "The lowest and highest price of the variants, shown in teasers.",
                    })}
                >
                    <div className={styles.fields}>
                        <NumberField
                            name="minPrice"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.minPrice", defaultMessage: "From" })}
                            min={0}
                            decimals={2}
                            format={currencyFormat}
                            locale={intl.locale}
                            validate={(value, values) => bothOrNeither(value, (values as ProductFormValues).maxPrice)}
                        />
                        <NumberField
                            name="maxPrice"
                            label={intl.formatMessage({ id: "uiDemo.productEdit.maxPrice", defaultMessage: "To" })}
                            min={0}
                            decimals={2}
                            format={currencyFormat}
                            locale={intl.locale}
                            validate={(value, values) => {
                                const { minPrice } = values as ProductFormValues;
                                if (value != null && minPrice != null && value < minPrice) {
                                    return intl.formatMessage({
                                        id: "uiDemo.productEdit.priceRangeInverted",
                                        defaultMessage: "Enter at least the “From” price",
                                    });
                                }
                                return bothOrNeither(value, minPrice);
                            }}
                        />
                    </div>
                </FormSection>
            </div>
        </Panel>
    );
}
