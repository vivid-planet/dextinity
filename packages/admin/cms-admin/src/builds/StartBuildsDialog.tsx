import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { Banner, Button, Dialog, DialogFormActions, EmptyState, Icon, Skeleton } from "@dextinity/ui";
import { CheckboxGroupField, focusOnError } from "@dextinity/ui-react-final-form";
import { FORM_ERROR } from "final-form";
import { useId } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import type { GQLBuildTemplatesQuery, GQLCreateBuildsMutation, GQLCreateBuildsMutationVariables } from "./StartBuildsDialog.generated";
import { StartBuildsForm } from "./StartBuildsDialog.sc";

const buildTemplatesQuery = gql`
    query BuildTemplates {
        buildTemplates {
            id
            name
            label
        }
    }
`;

const createBuildsMutation = gql`
    mutation CreateBuilds($input: CreateBuildsInput!) {
        createBuilds(input: $input)
    }
`;

interface StartBuildsFormValues {
    names: string[];
}

type StartBuildsDialogProps = {
    open: boolean;
    onClose: () => void;
};

/**
 * Starts builds of the chosen build templates, e.g. after a failed automatic publication.
 */
export function StartBuildsDialog({ open, onClose }: StartBuildsDialogProps) {
    const intl = useIntl();
    const formId = useId();

    const { data, loading, error, refetch } = useQuery<GQLBuildTemplatesQuery>(buildTemplatesQuery, {
        skip: !open,
        context: LocalErrorScopeApolloContext,
        notifyOnNetworkStatusChange: true,
    });
    const [startBuilds, { loading: starting }] = useMutation<GQLCreateBuildsMutation, GQLCreateBuildsMutationVariables>(createBuildsMutation, {
        refetchQueries: ["Builds"],
        context: LocalErrorScopeApolloContext,
    });

    const buildTemplates = data?.buildTemplates ?? [];

    const submit = async ({ names }: StartBuildsFormValues) => {
        try {
            await startBuilds({ variables: { input: { names } } });
        } catch {
            return {
                [FORM_ERROR]: intl.formatMessage({
                    id: "dextinity.pages.publisher.startBuildsDialog.failed",
                    defaultMessage: "The builds couldn't be started. Try again in a moment.",
                }),
            };
        }
        onClose();
    };

    return (
        <Form<StartBuildsFormValues> onSubmit={submit} initialValues={{ names: [] }} decorators={[focusOnError]}>
            {({ handleSubmit, submitError, form }) => (
                <Dialog
                    open={open}
                    onOpenChange={(nextOpen) => {
                        if (!nextOpen) {
                            onClose();
                            form.restart();
                        }
                    }}
                    dismissible={!starting}
                    title={intl.formatMessage({ id: "dextinity.pages.publisher.startBuildsDialog.header", defaultMessage: "Start manual builds" })}
                    description={intl.formatMessage({
                        id: "dextinity.pages.publisher.startBuildsDialog.hint",
                        defaultMessage:
                            "Please use this function only in exceptional cases. The more builds you start, the longer it takes until they are completed. If you need to rebuild manually, select only the scopes required.",
                    })}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={intl.formatMessage({
                                id: "dextinity.pages.publisher.startBuildsDialog.button",
                                defaultMessage: "Start builds",
                            })}
                            onCancel={() => {
                                onClose();
                                form.restart();
                            }}
                            submitting={starting}
                            submitDisabled={buildTemplates.length === 0}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    <StartBuildsForm id={formId} onSubmit={handleSubmit} noValidate>
                        {submitError && <Banner tone="error">{submitError}</Banner>}
                        {loading ? (
                            <Skeleton variant="row" count={3} />
                        ) : error ? (
                            <EmptyState
                                icon={<Icon name="error" />}
                                title={intl.formatMessage({
                                    id: "dextinity.pages.publisher.startBuildsDialog.loadError",
                                    defaultMessage: "The build templates couldn't be loaded",
                                })}
                                actions={
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        startIcon={<Icon name="reload" />}
                                        onClick={() => refetch()}
                                    >
                                        {intl.formatMessage({
                                            id: "dextinity.pages.publisher.startBuildsDialog.retry",
                                            defaultMessage: "Load again",
                                        })}
                                    </Button>
                                }
                            />
                        ) : buildTemplates.length === 0 ? (
                            <EmptyState
                                icon={<Icon name="online" />}
                                title={intl.formatMessage({
                                    id: "dextinity.pages.publisher.startBuildsDialog.empty",
                                    defaultMessage: "There are no build templates",
                                })}
                            />
                        ) : (
                            <CheckboxGroupField<string>
                                name="names"
                                label={intl.formatMessage({
                                    id: "dextinity.pages.publisher.startBuildsDialog.buildTemplates.name",
                                    defaultMessage: "Builds",
                                })}
                                required
                                selectAllLabel={intl.formatMessage({
                                    id: "dextinity.pages.publisher.startBuildsDialog.selectAll",
                                    defaultMessage: "All builds",
                                })}
                                options={buildTemplates.map((buildTemplate) => ({
                                    value: buildTemplate.name,
                                    label: buildTemplate.label || buildTemplate.name,
                                    description: buildTemplate.label ? buildTemplate.name : undefined,
                                }))}
                                requiredMessage={intl.formatMessage({
                                    id: "dextinity.pages.publisher.startBuildsDialog.required",
                                    defaultMessage: "Select at least one build",
                                })}
                            />
                        )}
                    </StartBuildsForm>
                </Dialog>
            )}
        </Form>
    );
}
