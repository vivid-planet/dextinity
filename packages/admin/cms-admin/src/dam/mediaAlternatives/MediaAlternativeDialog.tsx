import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { Banner, Dialog, DialogFormActions, Skeleton } from "@dextinity/ui";
import { focusOnError, InputField } from "@dextinity/ui-react-final-form";
import { FORM_ERROR } from "final-form";
import { useId } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { DamFileField } from "../../form/file/DamFileField";
import type { GQLDamFileFieldFileFragment } from "../../form/file/FileField";
import { damFileFieldFragment } from "../../form/file/FileField.fragment";
import type { GQLDamMediaAlternativeType } from "../../graphql.generated";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import type {
    GQLCreateDamMediaAlternativeMutation,
    GQLCreateDamMediaAlternativeMutationVariables,
    GQLEditMediaAlternativeQuery,
    GQLEditMediaAlternativeQueryVariables,
    GQLUpdateDamMediaAlternativeMutation,
    GQLUpdateDamMediaAlternativeMutationVariables,
} from "./MediaAlternativeDialog.generated";
import { DialogFields } from "./MediaAlternativeDialog.sc";
import type { MediaAlternativeDirection } from "./MediaAlternativesGrid";

const editMediaAlternativeQuery = gql`
    query EditMediaAlternative($id: ID!) {
        damMediaAlternative(id: $id) {
            id
            language
            for {
                ...DamFileFieldFile
            }
            alternative {
                ...DamFileFieldFile
            }
        }
    }
    ${damFileFieldFragment}
`;

const createDamMediaAlternativeMutation = gql`
    mutation CreateDamMediaAlternative($for: ID!, $alternative: ID!, $input: DamMediaAlternativeInput!) {
        createDamMediaAlternative(for: $for, alternative: $alternative, input: $input) {
            id
        }
    }
`;

const updateDamMediaAlternativeMutation = gql`
    mutation UpdateDamMediaAlternative($id: ID!, $input: DamMediaAlternativeUpdateInput!) {
        updateDamMediaAlternative(id: $id, input: $input) {
            id
        }
    }
`;

interface MediaAlternativeFormValues {
    file: GQLDamFileFieldFileFragment | null;
    language: string;
}

interface MediaAlternativeDialogProps {
    /** The alternative to edit, or `undefined` to add one. */
    id?: string;
    fileId: string;
    type: GQLDamMediaAlternativeType;
    direction: MediaAlternativeDirection;
    refetchQueries: string[];
    onClose: () => void;
}

/**
 * Adds or edits a media alternative of a file, e.g. the captions of a video: the other file and the language. Render it while the
 * dialog is open.
 */
export function MediaAlternativeDialog({ id, fileId, type, direction, refetchQueries, onClose }: MediaAlternativeDialogProps) {
    const intl = useIntl();
    const formId = useId();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { data, loading, error } = useQuery<GQLEditMediaAlternativeQuery, GQLEditMediaAlternativeQueryVariables>(editMediaAlternativeQuery, {
        variables: { id: id ?? "" },
        skip: id === undefined,
        context: LocalErrorScopeApolloContext,
    });
    const [createMediaAlternative] = useMutation<GQLCreateDamMediaAlternativeMutation, GQLCreateDamMediaAlternativeMutationVariables>(
        createDamMediaAlternativeMutation,
        { refetchQueries },
    );
    const [updateMediaAlternative] = useMutation<GQLUpdateDamMediaAlternativeMutation, GQLUpdateDamMediaAlternativeMutationVariables>(
        updateDamMediaAlternativeMutation,
        { refetchQueries },
    );

    const isOtherFileTheAlternative = direction === "for";
    const requiredMessage = intl.formatMessage({ id: "dextinity.form.required", defaultMessage: "Required" });
    const mediaAlternative = data?.damMediaAlternative;
    const initialValues: MediaAlternativeFormValues = mediaAlternative
        ? { file: isOtherFileTheAlternative ? mediaAlternative.alternative : mediaAlternative.for, language: mediaAlternative.language }
        : { file: null, language: "" };

    const save = async ({ file, language }: MediaAlternativeFormValues) => {
        if (file == null) {
            return { file: requiredMessage };
        }
        try {
            if (id === undefined) {
                await createMediaAlternative({
                    variables: {
                        ...(isOtherFileTheAlternative ? { for: fileId, alternative: file.id } : { for: file.id, alternative: fileId }),
                        input: { language, type },
                    },
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                await updateMediaAlternative({
                    variables: { id, input: { language, ...(isOtherFileTheAlternative ? { alternative: file.id } : { for: file.id }) } },
                    context: LocalErrorScopeApolloContext,
                });
            }
        } catch (saveError) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.dam.mediaAlternativeForm.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: saveError instanceof Error ? saveError.message : String(saveError) },
                ),
            };
        }
        onClose();
        return undefined;
    };

    const title = isOtherFileTheAlternative
        ? id === undefined
            ? intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.addCaptions", defaultMessage: "Add captions" })
            : intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.editCaptions", defaultMessage: "Edit captions" })
        : id === undefined
          ? intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.addVideo", defaultMessage: "Use for a video" })
          : intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.editVideo", defaultMessage: "Edit video" });

    return (
        <Form<MediaAlternativeFormValues> onSubmit={save} initialValues={initialValues} decorators={[focusOnError]}>
            {({ handleSubmit, submitting, submitError }) => (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            onClose();
                        }
                    }}
                    title={title}
                    labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={intl.formatMessage({ id: "dextinity.generic.save", defaultMessage: "Save" })}
                            submitting={submitting}
                            submitDisabled={loading || error != null}
                            onCancel={onClose}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    {loading ? (
                        <Skeleton variant="row" count={2} />
                    ) : (
                        <DialogFields id={formId} onSubmit={handleSubmit} noValidate>
                            <DamFileField
                                name="file"
                                label={
                                    isOtherFileTheAlternative
                                        ? intl.formatMessage({
                                              id: "dextinity.dam.mediaAlternativeForm.captionsFile",
                                              defaultMessage: "Captions file",
                                          })
                                        : intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.video", defaultMessage: "Video" })
                                }
                                required
                                requiredMessage={requiredMessage}
                                allowedMimetypes={isOtherFileTheAlternative ? filteredAcceptedMimeTypes.captions : filteredAcceptedMimeTypes.video}
                            />
                            <InputField
                                name="language"
                                label={intl.formatMessage({ id: "dextinity.dam.mediaAlternativeForm.language.label", defaultMessage: "Language" })}
                                helperText={intl.formatMessage({
                                    id: "dextinity.dam.mediaAlternativeForm.language.helperText",
                                    defaultMessage: "Please enter the language as a language code (e.g., en, de, it, ...).",
                                })}
                                required
                                requiredMessage={requiredMessage}
                            />
                            {(error != null || submitError != null) && <Banner tone="error">{error?.message ?? String(submitError)}</Banner>}
                        </DialogFields>
                    )}
                </Dialog>
            )}
        </Form>
    );
}
