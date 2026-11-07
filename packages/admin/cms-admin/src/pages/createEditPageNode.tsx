import { gql, useApolloClient, useQuery } from "@apollo/client";
import { ErrorScope } from "@dextinity/admin";
import { Banner, Dialog, DialogFormActions, FieldActions, Skeleton } from "@dextinity/ui";
import { type FieldAdapterActions, focusOnError, InputField, SelectField, SwitchField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { FORM_ERROR, type Mutator } from "final-form";
import setFieldTouched from "final-form-set-field-touched";
import type { DocumentNode } from "graphql";
import debounce from "p-debounce";
import { type JSX, type ReactNode, useCallback, useEffect, useId, useMemo, useState } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import { BlockInputField } from "../blocks/form/BlockInputField";
import { messageText } from "../blocks/form/messageText";
import { useContentTranslationFieldActionsProps } from "../blocks/form/useContentTranslationFieldActions";
import { useContentLanguage } from "../contentLanguage/useContentLanguage";
import type { DocumentInterface, DocumentType } from "../documents/types";
import { SyncFields } from "../form/SyncFields";
import type { GQLSlugAvailability } from "../graphql.generated";
import { useRedirectsScope } from "../redirects/redirectsConfig";
import { usePageTreeScope } from "./config/usePageTreeScope";
import type {
    GQLCreatePageNodeMutation,
    GQLCreatePageNodeMutationVariables,
    GQLEditPageNodeQuery,
    GQLEditPageNodeQueryVariables,
    GQLEditPageParentNodeQuery,
    GQLEditPageParentNodeQueryVariables,
    GQLIsPathAvailableQuery,
    GQLIsPathAvailableQueryVariables,
    GQLRedirectSourceAvailableQuery,
    GQLRedirectSourceAvailableQueryVariables,
    GQLUpdatePageNodeMutation,
    GQLUpdatePageNodeMutationVariables,
} from "./createEditPageNode.generated";
import { transformToSlug } from "./pageTree/transformToSlug";

interface EditPageNodeFinalFormValues {
    [key: string]: unknown;
}

interface CreateEditPageNodeProps {
    /** Further fields below the built-in ones, e.g. adapters of `@dextinity/ui-react-final-form` for the fields of `nodeFragment`. */
    additionalFormFields?: ReactNode;
    /** A fragment on `PageTreeNode` with the fields of `additionalFormFields`, loaded as their initial values. */
    nodeFragment?: { name: string; fragment: DocumentNode };
    /** Adds the values of `additionalFormFields` to the input of the create and update mutations. */
    valuesToInput?: (values: EditPageNodeFinalFormValues) => EditPageNodeFinalFormValues;
    /** Hides the "Hide in menu" switch. */
    disableHideInMenu?: boolean;
}

/**
 * Where a new page is added: under `parent` (at the top level without one), at `pos` among its siblings (at the end without one).
 */
export interface EditPageNodeInitialValues {
    parent?: string | null;
    pos?: number;
}

export interface EditPageNodeProps {
    /** Whether the dialog is open. */
    open: boolean;
    /** Called when the dialog requests to close: Cancel, Escape, the close button, or after saving. */
    onOpenChange: (open: boolean) => void;
    /** `add` creates a page, `edit` changes the properties of the page `id`. */
    mode: "add" | "edit";
    /** The page whose properties are edited. Required in `edit` mode. */
    id?: string | null;
    /** Where the page is added in `add` mode. */
    initialValues?: EditPageNodeInitialValues;
    /** The page tree category of a new page. */
    category: string;
    /** The document types to choose from. */
    documentTypes: Record<DocumentType, DocumentInterface>;
    /** Called after the page was created or saved, e.g. to select a new page. */
    onSaved?: (page: { id: string }) => void;
}

/**
 * Creates the dialog for adding a page and editing its properties – name, slug, document type, menu visibility – built with
 * `@dextinity/ui`.
 */
export function createEditPageNode({
    additionalFormFields,
    nodeFragment,
    valuesToInput,
    disableHideInMenu = false,
}: CreateEditPageNodeProps): (props: EditPageNodeProps) => JSX.Element {
    const editPageNodeQuery = gql`
        query EditPageNode($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                name
                slug
                path
                documentType
                hideInMenu
                parentId
                numberOfDescendants
                visibility
                document {
                    ... on DocumentInterface {
                        id
                    }
                }
                ${nodeFragment ? "...".concat(nodeFragment?.name) : ""}
            }
        }
        ${nodeFragment ? nodeFragment?.fragment : ""}
    `; // @TODO: use a graphql interface to ommit the ...on (DocumentInterface)

    const updatePageNodeMutation = gql`
        mutation UpdatePageNode($nodeId: ID!, $input: PageTreeNodeUpdateInput!) {
            updatePageTreeNode(id: $nodeId, input: $input) {
                id
                name
                slug
                documentType
                hideInMenu
                document {
                    ... on DocumentInterface {
                        id
                    }
                }
                ${nodeFragment ? "...".concat(nodeFragment?.name) : ""}
            }
        }
        ${nodeFragment ? nodeFragment?.fragment : ""}
    `;

    function EditPageNode({ open, onOpenChange, mode, id, initialValues, category, documentTypes, onSaved }: EditPageNodeProps) {
        const intl = useIntl();
        const formId = useId();
        const [submitting, setSubmitting] = useState(false);

        const { data, previousData, loading, error } = useQuery<GQLEditPageNodeQuery, GQLEditPageNodeQueryVariables>(editPageNodeQuery, {
            variables: { id: id ?? "" },
            fetchPolicy: "network-only", // The path could have changed (due to reordering of pages), so it's safe to have fresh data
            skip: !open || mode === "add" || id == null,
        });
        // The skipped query has no data while the dialog animates out, so the closing dialog keeps showing the page it was opened with
        const page = mode === "edit" ? (open ? data : previousData)?.page : undefined;
        const isSubmitting = open && submitting;

        const close = () => onOpenChange(false);

        const renderContent = () => {
            if (mode === "edit" && loading) {
                return <Skeleton variant="row" count={4} />;
            }
            if (mode === "edit" && (error != null || page == null)) {
                return (
                    <Banner tone="error">
                        {intl.formatMessage({ id: "dextinity.pages.pages.page.loadError", defaultMessage: "The page couldn't be loaded." })}
                    </Banner>
                );
            }
            return (
                <EditPageNodeForm
                    formId={formId}
                    mode={mode}
                    page={page ?? undefined}
                    parentId={mode === "add" ? (initialValues?.parent ?? null) : (page?.parentId ?? null)}
                    pos={mode === "add" ? initialValues?.pos : undefined}
                    category={category}
                    documentTypes={documentTypes}
                    updatePageNodeMutation={updatePageNodeMutation}
                    valuesToInput={valuesToInput}
                    disableHideInMenu={disableHideInMenu}
                    additionalFormFields={additionalFormFields}
                    onSubmittingChange={setSubmitting}
                    onSaved={(savedPage) => {
                        onSaved?.(savedPage);
                        close();
                    }}
                />
            );
        };

        return (
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
                dismissible={!isSubmitting}
                title={
                    mode === "add"
                        ? intl.formatMessage({ id: "dextinity.pages.pages.page.add.title", defaultMessage: "New page" })
                        : page != null
                          ? intl.formatMessage(
                                { id: "dextinity.pages.pages.page.edit.titleWithName", defaultMessage: "Page properties – {name}" },
                                { name: page.name },
                            )
                          : intl.formatMessage({ id: "dextinity.pages.pages.page.edit.title", defaultMessage: "Page properties" })
                }
                labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                footer={
                    <DialogFormActions
                        formId={formId}
                        submitLabel={
                            mode === "add"
                                ? intl.formatMessage({ id: "dextinity.generic.create", defaultMessage: "Create" })
                                : intl.formatMessage({ id: "dextinity.generic.save", defaultMessage: "Save" })
                        }
                        onCancel={close}
                        submitting={isSubmitting}
                        submitDisabled={mode === "edit" && page == null}
                        labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
                    />
                }
            >
                {renderContent()}
            </Dialog>
        );
    }

    return EditPageNode;
}

type EditPageNodePage = NonNullable<GQLEditPageNodeQuery["page"]>;

interface EditPageNodeFormProps extends Pick<CreateEditPageNodeProps, "additionalFormFields" | "valuesToInput"> {
    formId: string;
    mode: "add" | "edit";
    page?: EditPageNodePage;
    parentId: string | null;
    pos?: number;
    category: string;
    documentTypes: Record<DocumentType, DocumentInterface>;
    updatePageNodeMutation: DocumentNode;
    disableHideInMenu: boolean;
    onSubmittingChange: (submitting: boolean) => void;
    onSaved: (page: { id: string }) => void;
}

function EditPageNodeForm({
    formId,
    mode,
    page,
    parentId,
    pos,
    category,
    documentTypes,
    updatePageNodeMutation,
    valuesToInput,
    disableHideInMenu,
    additionalFormFields,
    onSubmittingChange,
    onSaved,
}: EditPageNodeFormProps) {
    const intl = useIntl();
    const apollo = useApolloClient();
    const scope = usePageTreeScope();
    const language = useContentLanguage({ scope });
    const redirectScope = useRedirectsScope();

    const [manuallyChangedSlug, setManuallyChangedSlug] = useState<boolean>(mode === "edit");

    const slug = page?.slug;

    const { data: parentNodeData } = useQuery<GQLEditPageParentNodeQuery, GQLEditPageParentNodeQueryVariables>(editPageParentNodeQuery, {
        variables: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parentId: parentId!,
        },
        fetchPolicy: "network-only",
        skip: parentId === null,
    });

    let parentPath: string | null = null;
    if (parentNodeData?.pageTreeNode) {
        parentPath = parentNodeData.pageTreeNode.slug === "home" ? "/home" : parentNodeData.pageTreeNode.path;
    }

    const documentTypeOptions = Object.keys(documentTypes).map((type) => ({
        value: type,
        label: documentTypes[type].displayName,
        textValue: messageText(intl, documentTypes[type].displayName) ?? type,
    }));

    const getTranslationActionsProps = useContentTranslationFieldActionsProps();
    const slugTranslationActions: FieldAdapterActions<string> | undefined = getTranslationActionsProps
        ? (context) => (
              <FieldActions
                  {...getTranslationActionsProps({
                      value: (context.value ?? "").replace(/[-_]+/g, " "),
                      setValue: (translatedSlug) => {
                          setManuallyChangedSlug(true);
                          context.setValue(transformToSlug(translatedSlug, language));
                      },
                  })}
              />
          )
        : undefined;

    useEffect(() => {
        apollo.cache.evict({ fieldName: "pageTreeNodeSlugAvailable" });
    }, [apollo.cache]);

    const isPathAvailable = useCallback(
        async (newSlug: string): Promise<GQLSlugAvailability> => {
            if (slug === newSlug) {
                // The unchanged slug is expected to be available
                return "Available";
            }

            const { data } = await apollo.query<GQLIsPathAvailableQuery, GQLIsPathAvailableQueryVariables>({
                query: isPathAvailableQuery,
                variables: {
                    parentId,
                    slug: newSlug,
                    scope,
                },
                fetchPolicy: "cache-first",
            });

            return data.availability;
        },
        [apollo, scope, parentId, slug],
    );

    const redirectSource = slug && parentPath ? `${parentPath}/${slug}` : slug ? `/${slug}` : null;
    const [debouncedRedirectSource] = useDebounce(redirectSource, 500);

    const { data: redirectQueryData } = useQuery<GQLRedirectSourceAvailableQuery, GQLRedirectSourceAvailableQueryVariables>(
        redirectSourceAvailableForPageEdit,
        {
            variables: debouncedRedirectSource
                ? {
                      scope: redirectScope,
                      source: debouncedRedirectSource,
                  }
                : undefined,
            skip: !debouncedRedirectSource,
        },
    );

    const isRedirectSourceAvailable = redirectQueryData?.redirectSourceAvailable ?? true;

    const validateSlug = useCallback(
        async (value: string | undefined) => {
            if (!value) {
                return undefined;
            }
            if (!isValidSlug(value)) {
                return intl.formatMessage({
                    id: "dextinity.pages.pages.page.validate.slug.error",
                    defaultMessage: "Slug contains forbidden symbols",
                });
            }
            const pathAvailability = await isPathAvailable(value);

            if (pathAvailability === "Taken") {
                return intl.formatMessage({
                    id: "dextinity.pages.pages.page.validate.path.taken",
                    defaultMessage: "Slug leads to duplicated path",
                });
            }

            if (pathAvailability === "Reserved") {
                return intl.formatMessage({
                    id: "dextinity.pages.pages.page.validate.path.block",
                    defaultMessage: "Slug leads to reserved path",
                });
            }
        },
        [intl, isPathAvailable],
    );

    // `p-debounce` instead of `use-debounce` because Final Form expects every validate call to resolve, which only `p-debounce` does
    const debouncedValidateSlug = useMemo(() => debounce(validateSlug, 500), [validateSlug]);

    const isPublishedPage = page?.visibility === "Published";
    const numberOfDescendants = page?.numberOfDescendants ?? 0;

    const handleSubmit = async (values: FormValues) => {
        let input = {
            name: values.name,
            slug: values.slug,
            hideInMenu: values.hideInMenu,
            createAutomaticRedirectsOnSlugChange: isRedirectSourceAvailable ? values.createAutomaticRedirectsOnSlugChange : false,
            attachedDocument: {
                id: values.documentType === page?.documentType ? page?.document?.id : undefined,
                type: values.documentType,
            },
        };

        if (valuesToInput) {
            input = { ...input, ...valuesToInput({ values }) };
        }

        try {
            if (mode === "edit") {
                if (!page) {
                    throw new Error("Missing page in edit mode");
                }

                await apollo.mutate<GQLUpdatePageNodeMutation, GQLUpdatePageNodeMutationVariables>({
                    mutation: updatePageNodeMutation,
                    variables: {
                        nodeId: page.id,
                        input,
                    },
                    context: {
                        errorScope: ErrorScope.Local,
                    },
                    refetchQueries: ["Pages"],
                });
                onSaved({ id: page.id });
            } else {
                const { data } = await apollo.mutate<GQLCreatePageNodeMutation, GQLCreatePageNodeMutationVariables>({
                    mutation: createPageNodeMutation,
                    variables: {
                        input: {
                            ...input,
                            parentId,
                            pos,
                        },
                        contentScope: scope,
                        category,
                    },
                    context: {
                        errorScope: ErrorScope.Local,
                    },
                    refetchQueries: ["Pages"],
                });
                if (data) {
                    onSaved({ id: data.createPageTreeNode.id });
                }
            }
        } catch {
            return {
                [FORM_ERROR]: intl.formatMessage({
                    id: "dextinity.pages.pages.page.saveError",
                    defaultMessage: "The page couldn't be saved. Please try again.",
                }),
            };
        }
    };

    const getCompletePath = (values: FormValues) => {
        if (values.slug === "home" && parentPath === null) {
            return "/";
        }
        return parentPath === null ? `/${values.slug}` : `${parentPath}/${values.slug}`;
    };

    return (
        <Form<FormValues>
            onSubmit={handleSubmit}
            initialValues={page ?? { documentType: Object.keys(documentTypes)[0] }}
            mutators={{
                setFieldTouched: setFieldTouched as Mutator<FormValues>,
            }}
            decorators={[focusOnError]}
        >
            {({ handleSubmit, form, values, dirtyFields, submitError, submitting }) => (
                <FormContent id={formId} onSubmit={handleSubmit} noValidate>
                    <SubmittingReporter submitting={submitting} onSubmittingChange={onSubmittingChange} />
                    {!manuallyChangedSlug && (
                        <SyncFields<string, string>
                            sourceField="name"
                            targetField="slug"
                            onChange={(name) => {
                                if (!form.getFieldState("slug")?.touched) {
                                    // Set field touched because otherwise no validation errors are shown
                                    form.mutators.setFieldTouched("slug", true);
                                }
                                return transformToSlug(name ?? "", language);
                            }}
                        />
                    )}
                    {submitError != null && <Banner tone="error">{submitError}</Banner>}
                    <FormSection>
                        <BlockInputField
                            name="name"
                            label={intl.formatMessage({ id: "dextinity.pages.pages.page.name", defaultMessage: "Name" })}
                            required
                            autoFocus
                        />
                        {slug !== "home" && (
                            <InputField
                                name="slug"
                                label={intl.formatMessage({ id: "dextinity.pages.pages.page.slug", defaultMessage: "Slug" })}
                                required
                                validate={debouncedValidateSlug}
                                onInput={() => setManuallyChangedSlug(true)}
                                actions={slugTranslationActions}
                                helperText={
                                    values.slug
                                        ? intl.formatMessage(
                                              { id: "dextinity.pages.pages.page.completePath", defaultMessage: "Complete path: {path}" },
                                              { path: getCompletePath(values) },
                                          )
                                        : undefined
                                }
                            />
                        )}
                        {mode === "edit" && dirtyFields.slug && isRedirectSourceAvailable && (
                            <SwitchField
                                name="createAutomaticRedirectsOnSlugChange"
                                initialValue={isPublishedPage}
                                description={intl.formatMessage(
                                    {
                                        id: "dextinity.pages.pages.page.createAutomaticRedirects.description",
                                        defaultMessage:
                                            "Users and search engines that visit the old path land on the new one. Turn it on if {numberOfDescendants, plural, =0 {this page was} other {these pages were}} already published or shared.",
                                    },
                                    { numberOfDescendants },
                                )}
                            >
                                {numberOfDescendants > 0
                                    ? intl.formatMessage({
                                          id: "dextinity.pages.pages.page.createAutomaticRedirects.labelWithChildPages",
                                          defaultMessage: "Create redirects for this page and all its child pages",
                                      })
                                    : intl.formatMessage({
                                          id: "dextinity.pages.pages.page.createAutomaticRedirects.labelSinglePage",
                                          defaultMessage: "Create a redirect from the old path",
                                      })}
                            </SwitchField>
                        )}
                        {mode === "edit" && dirtyFields.slug && !isRedirectSourceAvailable && (
                            <Banner tone="info">
                                {intl.formatMessage({
                                    id: "dextinity.pages.pages.page.redirectAlreadyExists",
                                    defaultMessage: "The slug was changed, but a redirect for the old path already exists.",
                                })}
                            </Banner>
                        )}
                    </FormSection>
                    <FormSection>
                        <SelectField<false, string>
                            name="documentType"
                            label={intl.formatMessage({ id: "dextinity.pages.pages.page.documentType", defaultMessage: "Document type" })}
                            options={documentTypeOptions}
                            required
                        />
                        {mode === "edit" && dirtyFields.documentType && (
                            <Banner tone="warning">
                                {intl.formatMessage({
                                    id: "dextinity.pages.pages.page.documentTypeChangeWarning",
                                    defaultMessage: "The page gets a new, empty document of this type. Its current content is no longer shown.",
                                })}
                            </Banner>
                        )}
                        {!disableHideInMenu && (
                            <SwitchField
                                name="hideInMenu"
                                description={intl.formatMessage({
                                    id: "dextinity.pages.pages.page.hideInMenu.description",
                                    defaultMessage: "The page can still be reached by its path.",
                                })}
                            >
                                {intl.formatMessage({ id: "dextinity.pages.pages.page.hideInMenu", defaultMessage: "Hide in menu" })}
                            </SwitchField>
                        )}
                        {additionalFormFields}
                    </FormSection>
                </FormContent>
            )}
        </Form>
    );
}

export function parseSerializedEditPageNodeInitialValues(serializedInitialValues: string | null = null): EditPageNodeInitialValues {
    const initialValues: EditPageNodeInitialValues = { parent: null };
    if (!serializedInitialValues) {
        return initialValues;
    }
    try {
        const parsed = JSON.parse(decodeURIComponent(serializedInitialValues));

        if ("parent" in parsed && typeof parsed.parent === "string") {
            initialValues.parent = parsed.parent;
        }
        if ("pos" in parsed && typeof parsed.pos === "number") {
            initialValues.pos = parsed.pos;
        }
    } catch {
        // failing to parse the initial values is ok, we use the defaults in this case
    }
    return initialValues;
}

const isPathAvailableQuery = gql`
    query IsPathAvailable($parentId: ID, $slug: String!, $scope: PageTreeNodeScopeInput!) {
        availability: pageTreeNodeSlugAvailable(parentId: $parentId, slug: $slug, scope: $scope)
    }
`;

const editPageParentNodeQuery = gql`
    query EditPageParentNode($parentId: ID!) {
        pageTreeNode(id: $parentId) {
            id
            path
            slug
        }
    }
`;

const createPageNodeMutation = gql`
    mutation CreatePageNode($input: PageTreeNodeCreateInput!, $contentScope: PageTreeNodeScopeInput!, $category: String!) {
        createPageTreeNode(input: $input, scope: $contentScope, category: $category) {
            id
        }
    }
`;

const redirectSourceAvailableForPageEdit = gql`
    query RedirectSourceAvailable($scope: RedirectScopeInput!, $source: String!) {
        redirectSourceAvailable(scope: $scope, source: $source)
    }
`;

interface FormValues {
    name: string;
    slug: string;
    path: string;
    documentType: string;
    hideInMenu: boolean;
    createAutomaticRedirectsOnSlugChange?: boolean;
}

const isValidSlug = (value: string) => {
    return /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(value);
};

function SubmittingReporter({ submitting, onSubmittingChange }: { submitting: boolean; onSubmittingChange: (submitting: boolean) => void }) {
    useEffect(() => {
        onSubmittingChange(submitting);
    }, [submitting, onSubmittingChange]);
    return null;
}

const FormContent = styled("form")`
    display: grid;
    gap: var(--dextinity-space-6);
`;

const FormSection = styled("div")`
    display: grid;
    gap: var(--dextinity-space-4);

    & + & {
        padding-block-start: var(--dextinity-space-6);
        border-block-start: 1px solid var(--dextinity-color-line);
    }
`;
