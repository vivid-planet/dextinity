import { gql, useMutation, useQuery } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, type ISelectionApi, Loading } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

import { FileField } from "../../form/file/FileField";
import type { GQLDamMediaAlternativeType } from "../../graphql.generated";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import type {
    GQLCreateDamMediaAlternativeMutation,
    GQLCreateDamMediaAlternativeMutationVariables,
    GQLEditMediaAlternativeQuery,
    GQLEditMediaAlternativeQueryVariables,
    GQLUpdateDamMediaAlternativeMutation,
    GQLUpdateDamMediaAlternativeMutationVariables,
} from "./MediaAlternativeForm.generated";
import { mediaAlternativesGridRefetchQueries } from "./MediaAlternativesGrid";

type Direction = "for" | "alternative";

interface MediaAlternativeFormProps {
    mode: "add" | "edit";
    selectionApi: ISelectionApi;
    fileId: string;
    id?: string;
    type: GQLDamMediaAlternativeType;
    direction?: Direction;
}

interface FormValues {
    alternative: { id: string; name: string; damPath: string };
    language: string;
}

export const MediaAlternativeForm = ({ mode, selectionApi, fileId, id, type, direction }: MediaAlternativeFormProps) => {
    const acceptedMimeTypes = useDamAcceptedMimeTypes();

    const [createDamMediaAlternative] = useMutation<GQLCreateDamMediaAlternativeMutation, GQLCreateDamMediaAlternativeMutationVariables>(
        createDamMediaAlternativeMutation,
        {
            refetchQueries: mediaAlternativesGridRefetchQueries,
        },
    );
    const [updateDamMediaAlternative] = useMutation<GQLUpdateDamMediaAlternativeMutation, GQLUpdateDamMediaAlternativeMutationVariables>(
        updateDamMediaAlternativeMutation,
        {
            refetchQueries: mediaAlternativesGridRefetchQueries,
        },
    );

    const { data, loading } = useQuery<GQLEditMediaAlternativeQuery, GQLEditMediaAlternativeQueryVariables>(editMediaAlternativeQuery, {
        variables: { id: id ?? "" },
        skip: mode === "add",
    });

    if (mode === "edit" && (loading || !data?.damMediaAlternative)) {
        return <Loading />;
    }

    const initialValues =
        mode === "edit" && data
            ? {
                  language: data.damMediaAlternative.language,
                  alternative: direction === "for" ? data.damMediaAlternative.alternative : data.damMediaAlternative.for,
              }
            : undefined;

    return (
        <FinalForm<FormValues>
            mode={mode}
            onSubmit={async ({ alternative, language }) => {
                if (mode === "add") {
                    await createDamMediaAlternative({
                        variables: {
                            ...(direction === "for" ? { alternative: alternative.id, for: fileId } : { alternative: fileId, for: alternative.id }),
                            input: {
                                language,
                                type,
                            },
                        },
                    });
                } else {
                    if (id === undefined) {
                        throw new Error("id is required for update mode");
                    }
                    await updateDamMediaAlternative({
                        variables: {
                            id,
                            input: {
                                language,
                                ...(direction === "for" ? { alternative: alternative.id } : { for: alternative.id }),
                            },
                        },
                    });
                }
            }}
            onAfterSubmit={() => selectionApi.handleDeselect()}
            initialValues={initialValues}
        >
            <Field
                name="alternative"
                component={FileField}
                allowedMimetypes={
                    direction === "for" ? acceptedMimeTypes.filteredAcceptedMimeTypes.captions : acceptedMimeTypes.filteredAcceptedMimeTypes.video
                }
                fullWidth
                required
            />
            <Field
                label={<FormattedMessage id="dextinity.dam.mediaAlternativeForm.language.label" defaultMessage="Language" />}
                name="language"
                helperText={
                    <FormattedMessage
                        id="dextinity.dam.mediaAlternativeForm.language.helperText"
                        defaultMessage="Please enter the language as a language code (e.g., en, de, it, ...)."
                    />
                }
                component={FinalFormInput}
                fullWidth
                required
            />
        </FinalForm>
    );
};

const updateDamMediaAlternativeMutation = gql`
    mutation UpdateDamMediaAlternative($id: ID!, $input: DamMediaAlternativeUpdateInput!) {
        updateDamMediaAlternative(id: $id, input: $input) {
            id
        }
    }
`;

const editMediaAlternativeQuery = gql`
    query EditMediaAlternative($id: ID!) {
        damMediaAlternative(id: $id) {
            id
            language
            for {
                id
                name
                damPath
            }
            alternative {
                id
                name
                damPath
            }
        }
    }
`;

const createDamMediaAlternativeMutation = gql`
    mutation CreateDamMediaAlternative($for: ID!, $alternative: ID!, $input: DamMediaAlternativeInput!) {
        createDamMediaAlternative(for: $for, alternative: $alternative, input: $input) {
            id
        }
    }
`;
