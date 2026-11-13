import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt } from "@dextinity/admin";
import {
    Banner,
    Button,
    Chip,
    EmptyState,
    Icon,
    IconButton,
    KeyValueList,
    Panel,
    SaveState,
    type SelectOption,
    Skeleton,
    useKeyboardShortcut,
} from "@dextinity/ui";
import {
    focusOnError,
    InputField,
    SelectField,
    SwitchField,
    TextareaField,
    useFormSaveState,
    useHasUnsavedChanges,
} from "@dextinity/ui-react-final-form";
import { isFQDN } from "class-validator";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { type JSX, useEffect, useId, useMemo, useState } from "react";
import { Field, Form, useForm, useFormState } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";
import { useLocation } from "react-router";

import { createFinalFormBlock } from "../blocks/form/createFinalFormBlock";
import type { BlockInterface, BlockState } from "../blocks/types";
import type { GQLRedirectInput, GQLRedirectSourceType, GQLRedirectType } from "../graphql.generated";
import {
    createRedirectMutation,
    redirectDetailQuery,
    redirectSourceAvailableQuery,
    updateRedirectDetailActivenessMutation,
    updateRedirectMutation,
} from "./RedirectEditPanel.gql";
import type {
    GQLCreateRedirectMutation,
    GQLCreateRedirectMutationVariables,
    GQLRedirectDetailFragment,
    GQLRedirectDetailQuery,
    GQLRedirectDetailQueryVariables,
    GQLRedirectSourceAvailableQuery,
    GQLRedirectSourceAvailableQueryVariables,
    GQLUpdateRedirectDetailActivenessMutation,
    GQLUpdateRedirectDetailActivenessMutationVariables,
    GQLUpdateRedirectMutation,
    GQLUpdateRedirectMutationVariables,
} from "./RedirectEditPanel.gql.generated";
import { Footer, FooterActions, FormBody, Section, SectionTitle } from "./RedirectEditPanel.sc";
import { useRedirectsConfig } from "./redirectsConfig";
import { useGenerationTypeLabel } from "./useGenerationTypeLabel";
import { useRedirectTypeLabel } from "./useRedirectTypeLabel";

export interface RedirectUnsavedChanges {
    save: () => Promise<boolean>;
    discard: () => void;
}

interface RedirectFormValues {
    sourceType: GQLRedirectSourceType;
    source: string;
    redirectType: GQLRedirectType;
    target: BlockState<BlockInterface>;
    comment: string;
    active: boolean;
}

interface RedirectEditPanelProps {
    /** The redirect to edit; without one, a new redirect is created. */
    redirectId?: string;
    linkBlock: BlockInterface;
    scope: Record<string, unknown>;
    onClose: () => void;
    onCreated: (redirectId: string) => void;
    onUnsavedChangesChange: (unsavedChanges: RedirectUnsavedChanges | undefined) => void;
}

const redirectTypes: GQLRedirectType[] = ["temporary", "permanent"];
const pathPattern = /^\/([a-zA-Z0-9-._~/:?=&]|%[0-9a-fA-F]{2})+$/;
const formDecorators = [focusOnError];

export function RedirectEditPanel({ redirectId, linkBlock, scope, onClose, onCreated, onUnsavedChangesChange }: RedirectEditPanelProps): JSX.Element {
    const intl = useIntl();
    const { data, loading, error } = useQuery<GQLRedirectDetailQuery, GQLRedirectDetailQueryVariables>(
        redirectDetailQuery,
        redirectId ? { variables: { id: redirectId }, context: LocalErrorScopeApolloContext, fetchPolicy: "network-only" } : { skip: true },
    );

    const closeButton = (
        <IconButton
            aria-label={intl.formatMessage({ id: "dextinity.redirects.panel.close", defaultMessage: "Close" })}
            variant="text"
            color="secondary"
            size="small"
            onClick={onClose}
        >
            <Icon name="close" />
        </IconButton>
    );

    if (redirectId && !data) {
        return (
            <Panel title={intl.formatMessage({ id: "dextinity.redirects.panel.editTitle", defaultMessage: "Edit redirect" })} actions={closeButton}>
                {loading ? (
                    <FormBody aria-busy>
                        <Skeleton variant="row" count={4} />
                    </FormBody>
                ) : (
                    <EmptyState
                        icon={<Icon name="warning-triangle" />}
                        title={intl.formatMessage({ id: "dextinity.redirects.panel.loadFailed", defaultMessage: "The redirect couldn't be loaded" })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    return (
        <RedirectForm
            redirect={data?.redirect}
            linkBlock={linkBlock}
            scope={scope}
            closeButton={closeButton}
            onCreated={onCreated}
            onUnsavedChangesChange={onUnsavedChangesChange}
        />
    );
}

interface RedirectFormProps extends Pick<RedirectEditPanelProps, "linkBlock" | "scope" | "onCreated" | "onUnsavedChangesChange"> {
    redirect?: GQLRedirectDetailFragment;
    closeButton: JSX.Element;
}

function RedirectForm({ redirect, linkBlock, scope, closeButton, onCreated, onUnsavedChangesChange }: RedirectFormProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const [savedRedirect, setSavedRedirect] = useState(redirect);
    const [initialValues, setInitialValues] = useState<RedirectFormValues>(() => toFormValues(redirect, linkBlock));
    const FinalFormLinkBlock = useMemo(() => createFinalFormBlock(linkBlock), [linkBlock]);

    const save = async (values: RedirectFormValues): Promise<SubmissionErrors | undefined> => {
        const input: GQLRedirectInput = {
            sourceType: values.sourceType,
            source: values.source,
            target: linkBlock.state2Output(values.target),
            comment: values.comment.trim() === "" ? null : values.comment,
            generationType: savedRedirect?.generationType ?? "manual",
            redirectType: values.redirectType,
        };
        try {
            let result: GQLRedirectDetailFragment | undefined;
            if (savedRedirect) {
                const { data } = await client.mutate<GQLUpdateRedirectMutation, GQLUpdateRedirectMutationVariables>({
                    mutation: updateRedirectMutation,
                    variables: { id: savedRedirect.id, input, lastUpdatedAt: savedRedirect.updatedAt },
                    context: LocalErrorScopeApolloContext,
                    refetchQueries: ["PaginatedRedirects"],
                });
                result = data?.updateRedirect;
                if (result && result.active !== values.active) {
                    // `updateRedirect` doesn't set the activation date, `updateRedirectActiveness` does
                    const { data: activenessData } = await client.mutate<
                        GQLUpdateRedirectDetailActivenessMutation,
                        GQLUpdateRedirectDetailActivenessMutationVariables
                    >({
                        mutation: updateRedirectDetailActivenessMutation,
                        variables: { id: result.id, input: { active: values.active } },
                        context: LocalErrorScopeApolloContext,
                        refetchQueries: ["PaginatedRedirects"],
                    });
                    result = activenessData?.updateRedirectActiveness;
                }
            } else {
                const { data } = await client.mutate<GQLCreateRedirectMutation, GQLCreateRedirectMutationVariables>({
                    mutation: createRedirectMutation,
                    variables: { scope, input: { ...input, active: values.active } },
                    context: LocalErrorScopeApolloContext,
                    refetchQueries: ["PaginatedRedirects"],
                });
                result = data?.createRedirect;
            }
            if (result) {
                setSavedRedirect(result);
                setInitialValues(values);
                if (!savedRedirect) {
                    onCreated(result.id);
                }
            }
            return undefined;
        } catch (error) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.redirects.panel.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            };
        }
    };

    return (
        <Form<RedirectFormValues> onSubmit={save} initialValues={initialValues} initialValuesEqual={deepEqual} decorators={formDecorators}>
            {({ handleSubmit }) => (
                <Panel
                    title={savedRedirect?.source ?? intl.formatMessage({ id: "dextinity.redirects.panel.newTitle", defaultMessage: "New redirect" })}
                    actions={closeButton}
                >
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-label={intl.formatMessage({ id: "dextinity.redirects.panel.formLabel", defaultMessage: "Redirect" })}
                    >
                        <RedirectFormContent
                            savedRedirect={savedRedirect}
                            cachedRedirect={redirect}
                            onSavedRedirectChange={setSavedRedirect}
                            scope={scope}
                            FinalFormLinkBlock={FinalFormLinkBlock}
                            onUnsavedChangesChange={onUnsavedChangesChange}
                        />
                    </form>
                </Panel>
            )}
        </Form>
    );
}

interface RedirectFormContentProps {
    savedRedirect?: GQLRedirectDetailFragment;
    cachedRedirect?: GQLRedirectDetailFragment;
    onSavedRedirectChange: (redirect: GQLRedirectDetailFragment) => void;
    scope: Record<string, unknown>;
    FinalFormLinkBlock: ReturnType<typeof createFinalFormBlock>;
    onUnsavedChangesChange: (unsavedChanges: RedirectUnsavedChanges | undefined) => void;
}

function RedirectFormContent({
    savedRedirect,
    cachedRedirect,
    onSavedRedirectChange,
    scope,
    FinalFormLinkBlock,
    onUnsavedChangesChange,
}: RedirectFormContentProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const location = useLocation();
    const form = useForm<RedirectFormValues>();
    const saveState = useFormSaveState();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const getGenerationTypeLabel = useGenerationTypeLabel();
    const getRedirectTypeLabel = useRedirectTypeLabel();
    const { enableRedirectType } = useRedirectsConfig();
    const { values, submitError, submitting } = useFormState<RedirectFormValues>({
        subscription: { values: true, submitError: true, submitting: true },
    });

    const unsavedChanges = useMemo<RedirectUnsavedChanges>(
        () => ({
            save: async () => {
                await form.submit();
                const { hasValidationErrors, hasSubmitErrors } = form.getState();
                return !hasValidationErrors && !hasSubmitErrors;
            },
            discard: () => form.reset(),
        }),
        [form],
    );

    useEffect(() => {
        onUnsavedChangesChange(hasUnsavedChanges ? unsavedChanges : undefined);
    }, [hasUnsavedChanges, unsavedChanges, onUnsavedChangesChange]);

    useEffect(() => () => onUnsavedChangesChange(undefined), [onUnsavedChangesChange]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        if (
            !cachedRedirect ||
            !savedRedirect ||
            cachedRedirect.id !== savedRedirect.id ||
            cachedRedirect.updatedAt === savedRedirect.updatedAt ||
            submitting
        ) {
            return;
        }
        // The list changed the activation of the open redirect: adopt it without losing the user's other edits
        onSavedRedirectChange(cachedRedirect);
        form.setConfig("keepDirtyOnReinitialize", true);
        form.initialize({ ...form.getState().initialValues, active: cachedRedirect.active });
        form.setConfig("keepDirtyOnReinitialize", false);
    }, [cachedRedirect, savedRedirect, submitting, form, onSavedRedirectChange]);

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    const sourceTypeOptions: SelectOption[] = [
        { value: "path", label: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source.type.path", defaultMessage: "Path" }) },
        { value: "domain", label: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source.type.domain", defaultMessage: "Domain" }) },
    ];

    const redirectTypeOptions: SelectOption<GQLRedirectType>[] = redirectTypes.map((redirectType) => ({
        value: redirectType,
        label: getRedirectTypeLabel(redirectType),
    }));

    const validateSource = async (source: string, allValues: object) => {
        if (source === "") {
            return undefined;
        }
        if ((allValues as RedirectFormValues).sourceType === "domain") {
            return isFQDN(source)
                ? undefined
                : intl.formatMessage({
                      id: "dextinity.pages.redirects.validate.domain.error",
                      defaultMessage: "Needs to be a valid domain (e.g. example.com)",
                  });
        }
        if (!source.startsWith("/")) {
            return intl.formatMessage({ id: "dextinity.pages.redirects.validate.path.error", defaultMessage: "Needs to start with /" });
        }
        if (!pathPattern.test(source)) {
            return intl.formatMessage({ id: "dextinity.pages.redirects.validate.path.invalidPathError", defaultMessage: "Invalid path" });
        }
        if (source === savedRedirect?.source) {
            return undefined;
        }
        const { data } = await client.query<GQLRedirectSourceAvailableQuery, GQLRedirectSourceAvailableQueryVariables>({
            query: redirectSourceAvailableQuery,
            variables: { scope, source },
            fetchPolicy: "network-only",
            context: LocalErrorScopeApolloContext,
        });
        return data.redirectSourceAvailable
            ? undefined
            : intl.formatMessage(
                  { id: "dextinity.redirects.form.validation.sourceTaken", defaultMessage: "Source {source} is not available" },
                  { source },
              );
    };

    const targetTitleId = useId();
    const requiredMessage = intl.formatMessage({ id: "dextinity.redirects.panel.required", defaultMessage: "Required" });

    return (
        <RouterPrompt
            message={(nextLocation) =>
                nextLocation.pathname === location.pathname || !hasUnsavedChanges
                    ? true
                    : intl.formatMessage({
                          id: "dextinity.redirects.panel.unsavedChangesPrompt",
                          defaultMessage: "Do you want to save your changes?",
                      })
            }
            saveAction={unsavedChanges.save}
            resetAction={unsavedChanges.discard}
        >
            <FormBody>
                {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                <SelectField<false, GQLRedirectSourceType>
                    name="sourceType"
                    label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source.type", defaultMessage: "Source type" })}
                    options={sourceTypeOptions as SelectOption<GQLRedirectSourceType>[]}
                    required
                    requiredMessage={requiredMessage}
                    validateFields={["source"]}
                />
                {values.sourceType === "domain" ? (
                    <Banner tone="warning">
                        {intl.formatMessage({
                            id: "dextinity.pages.redirects.redirect.source.type.domain.warning",
                            defaultMessage: "This only works if the domain is configured correctly.",
                        })}
                    </Banner>
                ) : null}
                <InputField
                    name="source"
                    label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source", defaultMessage: "Source" })}
                    required
                    requiredMessage={requiredMessage}
                    validate={validateSource}
                    placeholder={values.sourceType === "domain" ? "example.com" : "/example-path"}
                    spellCheck={false}
                />
                {enableRedirectType && values.sourceType === "path" ? (
                    <>
                        <SelectField<false, GQLRedirectType>
                            name="redirectType"
                            label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.redirectType", defaultMessage: "Redirect type" })}
                            options={redirectTypeOptions}
                            required
                            requiredMessage={requiredMessage}
                        />
                        {values.redirectType === "permanent" ? (
                            <Banner tone="warning">
                                {intl.formatMessage({
                                    id: "dextinity.pages.redirects.redirect.redirectType.permanent.warning",
                                    defaultMessage:
                                        "Browsers, search engines and CDNs cache permanent redirects for a long time. Changing or removing this redirect later may not take effect for visitors who have already been redirected. Only use a permanent redirect if the source will never be used again, otherwise use the standard redirect.",
                                })}
                            </Banner>
                        ) : null}
                    </>
                ) : null}
                <Section aria-labelledby={targetTitleId}>
                    <SectionTitle id={targetTitleId}>
                        {intl.formatMessage({ id: "dextinity.pages.redirects.redirect.target", defaultMessage: "Target" })}
                    </SectionTitle>
                    <Field name="target" component={FinalFormLinkBlock} isEqual={deepEqual} />
                </Section>
                <TextareaField
                    name="comment"
                    label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.comment", defaultMessage: "Comment" })}
                    rows={2}
                />
                <SwitchField
                    name="active"
                    description={intl.formatMessage({
                        id: "dextinity.redirects.panel.activeDescription",
                        defaultMessage: "Only active redirects forward visitors.",
                    })}
                >
                    {intl.formatMessage({ id: "dextinity.redirects.active", defaultMessage: "Active" })}
                </SwitchField>
                {savedRedirect ? (
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({
                                    id: "dextinity.pages.redirects.redirect.generationType",
                                    defaultMessage: "Generation Type",
                                }),
                                value: (
                                    <Chip size="small" color={savedRedirect.generationType === "automatic" ? "info" : "secondary"} variant="outlined">
                                        {getGenerationTypeLabel(savedRedirect.generationType)}
                                    </Chip>
                                ),
                            },
                            {
                                key: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.activatedAt", defaultMessage: "Activation Date" }),
                                value: savedRedirect.activatedAt ? (
                                    <FormattedDate value={savedRedirect.activatedAt} dateStyle="medium" timeStyle="short" />
                                ) : (
                                    "–"
                                ),
                            },
                            {
                                key: intl.formatMessage({ id: "dextinity.redirects.panel.createdAt", defaultMessage: "Created" }),
                                value: <FormattedDate value={savedRedirect.createdAt} dateStyle="medium" timeStyle="short" />,
                            },
                            {
                                key: intl.formatMessage({ id: "dextinity.redirects.panel.updatedAt", defaultMessage: "Last saved" }),
                                value: <FormattedDate value={savedRedirect.updatedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                ) : null}
                <Footer>
                    <SaveState
                        {...saveState}
                        locale={intl.locale}
                        labels={{
                            saved: intl.formatMessage({ id: "dextinity.redirects.panel.saveState.saved", defaultMessage: "Saved" }),
                            dirty: intl.formatMessage({ id: "dextinity.redirects.panel.saveState.dirty", defaultMessage: "Unsaved changes" }),
                            saving: intl.formatMessage({ id: "dextinity.redirects.panel.saveState.saving", defaultMessage: "Saving …" }),
                            error: intl.formatMessage({ id: "dextinity.redirects.panel.saveState.error", defaultMessage: "Not saved" }),
                            savedAt: intl.formatMessage({ id: "dextinity.redirects.panel.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                        }}
                    />
                    <FooterActions>
                        <Button
                            size="small"
                            variant="text"
                            color="secondary"
                            disabled={!hasUnsavedChanges || submitting}
                            onClick={() => form.reset()}
                        >
                            {intl.formatMessage({ id: "dextinity.redirects.panel.reset", defaultMessage: "Reset" })}
                        </Button>
                        <Button
                            type="submit"
                            size="small"
                            startIcon={<Icon name="check" />}
                            loading={submitting}
                            disabled={!hasUnsavedChanges && savedRedirect != null}
                        >
                            {intl.formatMessage({ id: "dextinity.redirects.panel.save", defaultMessage: "Save" })}
                        </Button>
                    </FooterActions>
                </Footer>
            </FormBody>
        </RouterPrompt>
    );
}

function toFormValues(redirect: GQLRedirectDetailFragment | undefined, linkBlock: BlockInterface): RedirectFormValues {
    if (!redirect) {
        return { sourceType: "path", source: "", redirectType: "temporary", target: linkBlock.defaultValues(), comment: "", active: true };
    }
    return {
        sourceType: redirect.sourceType,
        source: redirect.source,
        redirectType: redirect.redirectType,
        target: linkBlock.input2State(redirect.target),
        comment: redirect.comment ?? "",
        active: redirect.active,
    };
}
