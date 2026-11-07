import { useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import type { ContentScope } from "@dextinity/cms-admin";
import { Banner, Dialog, DialogFormActions } from "@dextinity/ui";
import { InputField } from "@dextinity/ui-react-final-form";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { type JSX, useId, useState } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { createTargetGroupMutation } from "./CreateTargetGroupDialog.gql";
import type { GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables } from "./CreateTargetGroupDialog.gql.generated";
import { DialogBody } from "./CreateTargetGroupDialog.sc";

interface CreateTargetGroupFormValues {
    title: string;
}

interface CreateTargetGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scope: ContentScope;
    onCreated: (targetGroupId: string) => void;
}

export function CreateTargetGroupDialog({ open, onOpenChange, scope, onCreated }: CreateTargetGroupDialogProps): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const formId = useId();
    const [formKey, setFormKey] = useState(0);

    const close = () => {
        onOpenChange(false);
        setFormKey((key) => key + 1);
    };

    const create = async ({ title }: CreateTargetGroupFormValues): Promise<SubmissionErrors | undefined> => {
        try {
            const { data } = await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                mutation: createTargetGroupMutation,
                variables: { scope, input: { title } },
                context: LocalErrorScopeApolloContext,
                refetchQueries: ["TargetGroupsList"],
            });
            if (data) {
                close();
                onCreated(data.createBrevoTargetGroup.id);
            }
            return undefined;
        } catch (error) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.targetGroup.createFailed", defaultMessage: "The target group couldn't be created: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            };
        }
    };

    const title = intl.formatMessage({ id: "dextinity.targetGroup.newTargetGroup", defaultMessage: "New target group" });

    return (
        <Form<CreateTargetGroupFormValues> key={formKey} onSubmit={create} initialValues={{ title: "" }}>
            {({ handleSubmit, submitting, submitError }) => (
                <Dialog
                    open={open}
                    onOpenChange={(isOpen) => !isOpen && close()}
                    title={title}
                    description={intl.formatMessage({
                        id: "dextinity.targetGroup.createDescription",
                        defaultMessage: "Then choose the filters and the contacts of the target group.",
                    })}
                    size="small"
                    dismissible={!submitting}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={intl.formatMessage({ id: "dextinity.targetGroup.create", defaultMessage: "Create" })}
                            onCancel={close}
                            submitting={submitting}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.targetGroup.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    <form id={formId} onSubmit={handleSubmit} noValidate aria-label={title}>
                        <DialogBody>
                            {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                            <InputField
                                name="title"
                                label={intl.formatMessage({ id: "dextinity.targetGroup.title", defaultMessage: "Title" })}
                                required
                                requiredMessage={intl.formatMessage({ id: "dextinity.targetGroup.titleRequired", defaultMessage: "Enter a title" })}
                                autoFocus
                            />
                        </DialogBody>
                    </form>
                </Dialog>
            )}
        </Form>
    );
}
