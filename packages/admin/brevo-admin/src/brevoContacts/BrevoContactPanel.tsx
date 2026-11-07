import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt } from "@dextinity/admin";
import type { ContentScope } from "@dextinity/cms-admin";
import { Banner, Button, EmptyState, Icon, IconButton, KeyValueList, Panel, Skeleton, useKeyboardShortcut } from "@dextinity/ui";
import { CheckboxField, focusOnError, InputField, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { type JSX, type ReactNode, useEffect, useMemo, useState } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";
import { useLocation } from "react-router";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { BrevoFormSaveState } from "../common/form/BrevoFormSaveState";
import { FormSection } from "../common/form/FormSection";
import type { GQLSubscribeResponse } from "../graphql.generated";
import type { AdditionalAttributesFragment } from "./additionalAttributesFragment";
import {
    brevoContactDetailQuery,
    brevoContactModifiedAtQuery,
    createBrevoContactMutation,
    createBrevoTestContactMutation,
    updateBrevoContactMutation,
} from "./BrevoContactPanel.gql";
import type {
    GQLBrevoContactDetailQuery,
    GQLBrevoContactDetailQueryVariables,
    GQLBrevoContactModifiedAtQuery,
    GQLBrevoContactModifiedAtQueryVariables,
    GQLCreateBrevoContactMutation,
    GQLCreateBrevoContactMutationVariables,
    GQLCreateBrevoTestContactMutation,
    GQLCreateBrevoTestContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoContactPanel.gql.generated";
import { Footer, FooterActions, FormBody } from "./BrevoContactPanel.sc";
import { ContactStatus } from "./ContactStatus";

export type EditBrevoContactFormValues = {
    [key: string]: unknown;
};

type ContactFormValues = EditBrevoContactFormValues & {
    email: string;
    redirectionUrl: string;
    sendDoubleOptIn: boolean;
};

type ContactDetail = GQLBrevoContactDetailQuery["brevoContact"] & Record<string, unknown>;

export type BrevoContactsVariant = "contacts" | "testContacts";

export interface BrevoContactUnsavedChanges {
    save: () => Promise<boolean>;
    discard: () => void;
}

export interface BrevoContactPanelProps {
    variant: BrevoContactsVariant;
    /** The contact to edit; without one, a new contact is created. */
    contactId?: number;
    scope: ContentScope;
    additionalAttributesFragment?: AdditionalAttributesFragment;
    additionalFormFields?: ReactNode;
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
    onClose: () => void;
    /** Called after a new contact was created, with what to tell the user about it. */
    onCreated: (message: string) => void;
    onUnsavedChangesChange: (unsavedChanges: BrevoContactUnsavedChanges | undefined) => void;
}

const formDecorators = [focusOnError];
const saveConflictKey = "saveConflict";

export function BrevoContactPanel(props: BrevoContactPanelProps): JSX.Element {
    const { contactId, scope, additionalAttributesFragment, onClose } = props;
    const intl = useIntl();
    const detailQuery = useMemo(() => brevoContactDetailQuery(additionalAttributesFragment), [additionalAttributesFragment]);
    const { data, loading, error, refetch } = useQuery<GQLBrevoContactDetailQuery, GQLBrevoContactDetailQueryVariables>(
        detailQuery,
        contactId ? { variables: { id: contactId, scope }, context: LocalErrorScopeApolloContext, fetchPolicy: "network-only" } : { skip: true },
    );

    const closeButton = (
        <IconButton
            aria-label={intl.formatMessage({ id: "dextinity.brevoContact.panel.close", defaultMessage: "Close" })}
            variant="text"
            color="secondary"
            size="small"
            onClick={onClose}
        >
            <Icon name="close" />
        </IconButton>
    );

    if (contactId && !data) {
        return (
            <Panel
                title={intl.formatMessage({ id: "dextinity.brevoContacts.editBrevoContact", defaultMessage: "Edit contact" })}
                actions={closeButton}
            >
                {loading ? (
                    <FormBody aria-busy>
                        <Skeleton variant="row" count={4} />
                    </FormBody>
                ) : (
                    <EmptyState
                        icon={<Icon name="warning" />}
                        title={intl.formatMessage({
                            id: "dextinity.brevoContact.panel.loadFailed",
                            defaultMessage: "The contact couldn't be loaded",
                        })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    return <BrevoContactForm {...props} contact={data?.brevoContact as ContactDetail | undefined} closeButton={closeButton} reload={refetch} />;
}

interface BrevoContactFormProps extends BrevoContactPanelProps {
    contact?: ContactDetail;
    closeButton: JSX.Element;
    reload: () => Promise<unknown>;
}

function BrevoContactForm({
    variant,
    contact,
    scope,
    additionalAttributesFragment,
    additionalFormFields,
    input2State,
    closeButton,
    reload,
    onCreated,
    onUnsavedChangesChange,
}: BrevoContactFormProps) {
    const intl = useIntl();
    const client = useApolloClient();

    const initialValues = useMemo<ContactFormValues>(
        () => ({
            email: contact?.email ?? "",
            redirectionUrl: "",
            sendDoubleOptIn: true,
            ...input2State?.(contact),
        }),
        [contact, input2State],
    );

    const save = async (values: ContactFormValues): Promise<SubmissionErrors | undefined> => {
        const { email, redirectionUrl, sendDoubleOptIn, ...attributeValues } = values;
        try {
            if (contact) {
                const { data: latest } = await client.query<GQLBrevoContactModifiedAtQuery, GQLBrevoContactModifiedAtQueryVariables>({
                    query: brevoContactModifiedAtQuery,
                    variables: { id: contact.id, scope },
                    fetchPolicy: "no-cache",
                    context: LocalErrorScopeApolloContext,
                });
                if (latest.brevoContact.modifiedAt !== contact.modifiedAt) {
                    return {
                        [saveConflictKey]: true,
                        [FORM_ERROR]: intl.formatMessage({
                            id: "dextinity.brevoContact.panel.saveConflict",
                            defaultMessage: "Someone else changed this contact in the meantime. Load their version to continue.",
                        }),
                    };
                }
                await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                    mutation: updateBrevoContactMutation(additionalAttributesFragment),
                    variables: { id: contact.id, input: { ...attributeValues, blocked: contact.emailBlacklisted }, scope },
                    context: LocalErrorScopeApolloContext,
                    refetchQueries: [variant === "contacts" ? "BrevoContactsList" : "BrevoTestContactsList"],
                });
                await reload();
                return undefined;
            }

            let response: GQLSubscribeResponse | undefined;
            if (variant === "contacts") {
                const { data } = await client.mutate<GQLCreateBrevoContactMutation, GQLCreateBrevoContactMutationVariables>({
                    mutation: createBrevoContactMutation,
                    variables: { scope, input: { ...attributeValues, email, redirectionUrl, sendDoubleOptIn, blocked: false } },
                    context: LocalErrorScopeApolloContext,
                });
                response = data?.createBrevoContact;
            } else {
                const { data } = await client.mutate<GQLCreateBrevoTestContactMutation, GQLCreateBrevoTestContactMutationVariables>({
                    mutation: createBrevoTestContactMutation,
                    variables: { scope, input: { ...attributeValues, email, blocked: false } },
                    context: LocalErrorScopeApolloContext,
                });
                response = data?.createBrevoTestContact;
            }
            if (response !== "SUCCESSFUL") {
                return { [FORM_ERROR]: subscribeErrorMessage(response) };
            }
            await client.refetchQueries({ include: [variant === "contacts" ? "BrevoContactsList" : "BrevoTestContactsList"] });
            onCreated(
                variant === "contacts" && sendDoubleOptIn
                    ? intl.formatMessage(
                          {
                              id: "dextinity.brevoContact.panel.createdWithDoubleOptIn",
                              defaultMessage: "{email} gets a double opt-in email and shows up here once the subscription is confirmed",
                          },
                          { email },
                      )
                    : intl.formatMessage({ id: "dextinity.brevoContact.panel.created", defaultMessage: "{email} added" }, { email }),
            );
            return undefined;
        } catch (saveError) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.brevoContact.panel.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: saveError instanceof Error ? saveError.message : String(saveError) },
                ),
            };
        }
    };

    const subscribeErrorMessage = (response: GQLSubscribeResponse | undefined) => {
        switch (response) {
            case "ERROR_CONTAINED_IN_ECG_RTR_LIST":
                return intl.formatMessage({
                    id: "dextinity.brevoContact.error.ecgRtrList",
                    defaultMessage: "The email address is on the ECG-RTR list (Robinson list) and can't be added",
                });
            case "ERROR_CONTACT_IS_BLACKLISTED":
                return intl.formatMessage({
                    id: "dextinity.brevoContact.error.blocked",
                    defaultMessage: "The contact is blocked and can't be added",
                });
            case "ERROR_CONTACT_ALREADY_EXISTS":
                return intl.formatMessage({
                    id: "dextinity.brevoContact.error.alreadyExists",
                    defaultMessage: "A contact with this email address already exists",
                });
            case "ERROR_MAXIMAL_NUMBER_OF_TEST_CONTACTS_REACHED":
                return intl.formatMessage({
                    id: "dextinity.brevoTestContact.contactLimitReached",
                    defaultMessage: "Contact limit of 100 reached. You cannot add more contacts.",
                });
            default:
                return intl.formatMessage({ id: "dextinity.brevoContact.error.unknown", defaultMessage: "The contact couldn't be added" });
        }
    };

    const newTitle =
        variant === "contacts"
            ? intl.formatMessage({ id: "dextinity.brevoContacts.addBrevoContact", defaultMessage: "New contact" })
            : intl.formatMessage({ id: "dextinity.brevoTestContacts.addBrevoTestContact", defaultMessage: "New test contact" });

    return (
        <Form<ContactFormValues> onSubmit={save} initialValues={initialValues} decorators={formDecorators}>
            {({ handleSubmit }) => (
                <Panel title={contact?.email ?? newTitle} actions={closeButton}>
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-label={intl.formatMessage({ id: "dextinity.brevoContacts.brevoContact", defaultMessage: "Contact" })}
                    >
                        <BrevoContactFormContent
                            variant={variant}
                            contact={contact}
                            additionalFormFields={additionalFormFields}
                            reload={reload}
                            onUnsavedChangesChange={onUnsavedChangesChange}
                        />
                    </form>
                </Panel>
            )}
        </Form>
    );
}

interface BrevoContactFormContentProps {
    variant: BrevoContactsVariant;
    contact?: ContactDetail;
    additionalFormFields?: ReactNode;
    reload: () => Promise<unknown>;
    onUnsavedChangesChange: (unsavedChanges: BrevoContactUnsavedChanges | undefined) => void;
}

function BrevoContactFormContent({ variant, contact, additionalFormFields, reload, onUnsavedChangesChange }: BrevoContactFormContentProps) {
    const intl = useIntl();
    const location = useLocation();
    const form = useForm<ContactFormValues>();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { allowAddingContactsWithoutDoi } = useBrevoConfig();
    const [reloading, setReloading] = useState(false);
    const { values, submitError, submitErrors, submitting } = useFormState<ContactFormValues>({
        subscription: { values: true, submitError: true, submitErrors: true, submitting: true },
    });

    const unsavedChanges = useMemo<BrevoContactUnsavedChanges>(
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

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    const loadLatestVersion = async () => {
        setReloading(true);
        try {
            await reload();
            form.reset();
        } finally {
            setReloading(false);
        }
    };

    const isNew = contact == null;
    const isSaveConflict = submitErrors?.[saveConflictKey] === true;

    return (
        <RouterPrompt
            message={(nextLocation) =>
                nextLocation.pathname === location.pathname || !hasUnsavedChanges
                    ? true
                    : intl.formatMessage({
                          id: "dextinity.brevoContact.panel.unsavedChangesPrompt",
                          defaultMessage: "Do you want to save your changes?",
                      })
            }
            saveAction={unsavedChanges.save}
            resetAction={unsavedChanges.discard}
        >
            <FormBody>
                {submitError ? (
                    <Banner
                        tone="error"
                        action={
                            isSaveConflict ? (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    loading={reloading}
                                    onClick={() => void loadLatestVersion()}
                                >
                                    {intl.formatMessage({ id: "dextinity.brevoContact.panel.loadLatest", defaultMessage: "Load latest version" })}
                                </Button>
                            ) : undefined
                        }
                    >
                        {submitError}
                    </Banner>
                ) : null}
                {isNew ? null : (
                    <Banner tone="info">
                        {intl.formatMessage({
                            id: "dextinity.brevoContact.contactEditAlert",
                            defaultMessage: "Editing a contact will affect all scopes and the target groups within those scopes.",
                        })}
                    </Banner>
                )}
                <InputField
                    name="email"
                    type="email"
                    label={intl.formatMessage({ id: "dextinity.brevoContact.email", defaultMessage: "Email" })}
                    readOnly={!isNew}
                    required
                    requiredMessage={intl.formatMessage({ id: "dextinity.brevoContact.emailRequired", defaultMessage: "Enter an email address" })}
                    validate={(email: string) =>
                        !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                            ? undefined
                            : intl.formatMessage({ id: "dextinity.brevoContact.emailInvalid", defaultMessage: "Enter a valid email address" })
                    }
                    spellCheck={false}
                    autoComplete="off"
                />
                {isNew && variant === "contacts" ? (
                    <FormSection title={intl.formatMessage({ id: "dextinity.brevoContact.doubleOptIn", defaultMessage: "Double opt-in" })}>
                        {allowAddingContactsWithoutDoi ? (
                            <CheckboxField name="sendDoubleOptIn">
                                {intl.formatMessage({ id: "dextinity.brevoContact.sendDoubleOptInMail", defaultMessage: "Send double opt-in email" })}
                            </CheckboxField>
                        ) : null}
                        {values.sendDoubleOptIn ? (
                            <Banner tone="info">
                                {intl.formatMessage({
                                    id: "dextinity.brevoContact.contactAddAlert",
                                    defaultMessage:
                                        "The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page.",
                                })}
                            </Banner>
                        ) : (
                            <Banner tone="warning">
                                {intl.formatMessage({
                                    id: "dextinity.brevoContact.contactNoOptInAlert",
                                    defaultMessage:
                                        "No Double Opt-In email will be sent. You are responsible for ensuring that recipients have provided their consent before proceeding. If consent has not been given, sending a Double Opt-In email is legally required. Additionally, the creation of the user will be tracked, and you may need to provide clarification if users report any issues.",
                                })}
                            </Banner>
                        )}
                        {values.sendDoubleOptIn ? (
                            <InputField
                                name="redirectionUrl"
                                type="url"
                                label={intl.formatMessage({ id: "dextinity.brevoContact.redirectionUrl.label", defaultMessage: "Redirection URL" })}
                                helperText={intl.formatMessage({
                                    id: "dextinity.brevoContact.redirectionUrl.helper",
                                    defaultMessage: "The contact is taken to this page after confirming the subscription in the double opt-in email.",
                                })}
                                spellCheck={false}
                            />
                        ) : null}
                    </FormSection>
                ) : null}
                {additionalFormFields ? (
                    <FormSection title={intl.formatMessage({ id: "dextinity.brevoContact.attributes", defaultMessage: "Attributes" })}>
                        {additionalFormFields}
                    </FormSection>
                ) : null}
                {contact ? (
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({ id: "dextinity.brevoContact.status", defaultMessage: "Status" }),
                                value: <ContactStatus blocked={contact.emailBlacklisted} />,
                            },
                            {
                                key: intl.formatMessage({ id: "dextinity.brevoContact.subscribedAt", defaultMessage: "Subscribed at" }),
                                value: <FormattedDate value={contact.createdAt} dateStyle="medium" timeStyle="short" />,
                            },
                            {
                                key: intl.formatMessage({ id: "dextinity.brevoContact.modifiedAt", defaultMessage: "Modified at" }),
                                value: <FormattedDate value={contact.modifiedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                ) : null}
                <Footer>
                    <BrevoFormSaveState />
                    <FooterActions>
                        <Button
                            size="small"
                            variant="text"
                            color="secondary"
                            disabled={!hasUnsavedChanges || submitting}
                            onClick={() => form.reset()}
                        >
                            {intl.formatMessage({ id: "dextinity.brevoContact.panel.reset", defaultMessage: "Reset" })}
                        </Button>
                        <Button
                            type="submit"
                            size="small"
                            startIcon={<Icon name="check" />}
                            loading={submitting}
                            disabled={!hasUnsavedChanges && !isNew}
                        >
                            {isNew
                                ? intl.formatMessage({ id: "dextinity.brevoContact.panel.create", defaultMessage: "Add contact" })
                                : intl.formatMessage({ id: "dextinity.brevoContact.panel.save", defaultMessage: "Save" })}
                        </Button>
                    </FooterActions>
                </Footer>
            </FormBody>
        </RouterPrompt>
    );
}
