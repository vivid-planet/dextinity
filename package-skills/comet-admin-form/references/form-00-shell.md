# Form Shell Template

**Always read this file first** — it is the base pattern for every form component.

## GQL Definitions

```typescript
import { gql } from "@apollo/client";
import { finalFormFileUploadFragment, finalFormFileUploadDownloadableFragment } from "@comet/cms-admin";
// Only import the above if the entity has FileUpload fields

export const <entityName>FormFragment = gql`
    fragment <EntityName>FormDetails on <EntityName> {
        <scalarFields>
        <relationFields e.g. category { id title }>
        <nestedObjectFields e.g. dimensions { width height depth }>
        <fileUploadFields>
    }
    ${finalFormFileUploadFragment}          // only if FileUpload fields without preview exist
    ${finalFormFileUploadDownloadableFragment} // only if FileUpload fields with preview exist
`;

export const <entityName>Query = gql`
    query <EntityName>($id: ID!) {
        <entityName>(id: $id) {
            id
            updatedAt
            ...<EntityName>FormDetails
        }
    }
    ${<entityName>FormFragment}
`;

export const create<EntityName>Mutation = gql`
    mutation Create<EntityName>($input: <EntityName>Input!) {
        create<EntityName>(input: $input) {
            <entityName> {
                id
                updatedAt
                ...<EntityName>FormDetails
            }
            errors {
                code
                field
            }
        }
    }
    ${<entityName>FormFragment}
`;
// Only include errors{} if the create mutation returns a payload type with errors

export const update<EntityName>Mutation = gql`
    mutation Update<EntityName>($id: ID!, $input: <EntityName>UpdateInput!) {
        update<EntityName>(id: $id, input: $input) {
            id
            updatedAt
            ...<EntityName>FormDetails
        }
    }
    ${<entityName>FormFragment}
`;
```

### Form Modes

The shell template above shows the default **create + edit** mode (`id` prop is optional). Some forms only need one mode:

**Edit-only form** — when entities are created elsewhere (e.g. via import, or by another system):

- `FormProps` has `id: string` (required, not optional)
- No `mode` variable needed — always `"edit"`
- No create mutation needed
- No `stackSwitchApi` needed
- `useQuery` always runs (no `skip` condition)
- `FinalForm` gets `mode="edit"`

**Add-only form** — when used in a dialog that only creates (e.g. `EditDialog` for quick creation):

- `FormProps` has no `id` prop
- No `mode` variable needed — always `"add"`
- No entity query needed
- No `useFormSaveConflict` needed (no existing data to conflict with)
- No `filterByFragment` / `initialValues` from query
- `FinalForm` gets `mode="add"`
- Typically receives an `onCreate` callback prop instead of using `stackSwitchApi`

### Fragment field rules by type

| Field type                    | Fragment entry                                     |
| ----------------------------- | -------------------------------------------------- |
| Scalar (string, number, bool) | Field name directly (e.g. `title`)                 |
| DateTime / LocalDate          | Field name directly (e.g. `createdAt`)             |
| Enum                          | Field name directly (e.g. `status`)                |
| ManyToOne relation            | `category { id title }` (id + label field)         |
| ManyToMany relation           | `tags { id title }` (id + label field)             |
| Nested scalar object          | `dimensions { width height depth }`                |
| FileUpload (with preview)     | `priceList { ...FinalFormFileUploadDownloadable }` |
| FileUpload (without preview)  | `datasheets { ...FinalFormFileUpload }`            |
| DAM Image                     | Skip                                               |
| Array of scalars              | Skip                                               |

### GQL Rules

- Always include `id` and `updatedAt` in the query (required for save conflict detection)
- Use exact mutation/query names and input types from the schema — do not guess. Some entities use the same input type for both create and update
- Only import `finalFormFileUploadFragment` / `finalFormFileUploadDownloadableFragment` when needed
- If create mutation returns a simple type (not a payload with errors), omit the errors block and adjust the create mutation response accordingly

---

## Form Component

```tsx
import { useApolloClient, useQuery } from "@apollo/client";
import {
    CheckboxField,
    Field,
    filterByFragment,
    FinalForm,
    FinalFormSubmitEvent,
    Loading,
    NumberField,
    TextAreaField,
    TextField,
    useFormApiRef,
    useStackSwitchApi,
    Future_DatePickerField,
    Future_DateTimePickerField,
    SelectField,         // if enum fields exist
} from "@comet/admin";
import { FileUploadField, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { FORM_ERROR, FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { <entityName>FormFragment, <entityName>Query, create<EntityName>Mutation, update<EntityName>Mutation } from "./<EntityName>Form.gql";
import {
    GQL<EntityName>FormDetailsFragment,
    GQL<EntityName>Query,
    GQL<EntityName>QueryVariables,
    GQLCreate<EntityName>Mutation,
    GQLCreate<EntityName>MutationVariables,
    GQLUpdate<EntityName>Mutation,
    GQLUpdate<EntityName>MutationVariables,
} from "./<EntityName>Form.gql.generated";
import { GQL<EntityName>MutationErrorCode } from "@src/graphql.generated";
// Import reusable relation field components:
import { <RelatedEntity>AsyncAutocompleteField } from "@src/<relatedEntityDomain>/components/<relatedEntity>AsyncAutocompleteField/<RelatedEntity>AsyncAutocompleteField";
// Import reusable enum field components:
import { <EnumName>SelectField } from "@src/<enumDomain>/components/<enumName>/<EnumName>SelectField";

// Only include FileUpload type overrides if entity has FileUpload fields:
import { GQLFinalFormFileUploadFragment, GQLFinalFormFileUploadDownloadableFragment } from "@comet/cms-admin";

type <EntityName>FormDetailsFragment = Omit<GQL<EntityName>FormDetailsFragment, "priceList" | "datasheets"> & {
    priceList: GQLFinalFormFileUploadDownloadableFragment | null;
    datasheets: GQLFinalFormFileUploadFragment[];
};

type FormValues = <EntityName>FormDetailsFragment;
// Omit fields that need type transformation, add transformed types:
// type FormValues = Omit<<EntityName>FormDetailsFragment, "lastCheckedAt"> & {
//     lastCheckedAt?: Date | null;
// };

interface FormProps {
    id?: string;
}

// Only include if create mutation has errors payload:
const submissionErrorMessages: Record<GQL<EntityName>MutationErrorCode, ReactNode> = {
    // errorCode: <FormattedMessage id="..." defaultMessage="..." />,
};

export function <EntityName>Form({ id }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQL<EntityName>Query, GQL<EntityName>QueryVariables>(
        <entityName>Query,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues = useMemo<Partial<FormValues>>(
        () =>
            data?.<entityName>
                ? {
                      ...filterByFragment<<EntityName>FormDetailsFragment>(<entityName>FormFragment, data.<entityName>),
                      // Transform DateTime fields:
                      // lastCheckedAt: data.<entityName>.lastCheckedAt ? new Date(data.<entityName>.lastCheckedAt) : undefined,
                      // Normalize nullable number fields (null → undefined) to prevent dirty handler issues:
                      // purchasePrice: data.<entityName>.purchasePrice ?? undefined,
                  }
                : {
                      // sensible defaults for new records
                  },
        [data],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "<entityName>", id);
            return resolveHasSaveConflict(data?.<entityName>.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (formValues: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) throw new Error("Conflicts detected");

        const output = {
            ...formValues,
            // Transform relation fields to IDs:
            // category: formValues.category ? formValues.category.id : null,
            // tags: formValues.tags.map((item) => item.id),
            // Transform DateTime fields:
            // lastCheckedAt: formValues.lastCheckedAt ? formValues.lastCheckedAt.toISOString() : null,
            // Transform FileUpload fields:
            // priceList: formValues.priceList ? formValues.priceList.id : null,
            // datasheets: formValues.datasheets?.map(({ id }) => id),
            // Remove read-only fields not in UpdateInput:
            // createdAt: undefined,  (strip audit fields from update)
        };

        if (mode === "edit") {
            if (!id) throw new Error();
            await client.mutate<GQLUpdate<EntityName>Mutation, GQLUpdate<EntityName>MutationVariables>({
                mutation: update<EntityName>Mutation,
                variables: { id, input: output },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreate<EntityName>Mutation, GQLCreate<EntityName>MutationVariables>({
                mutation: create<EntityName>Mutation,
                variables: { input: output },
            });

            // Only include error handling if create mutation has errors payload:
            if (mutationResponse?.create<EntityName>.errors.length) {
                return mutationResponse.create<EntityName>.errors.reduce(
                    (submissionErrors, error) => {
                        const errorMessage = submissionErrorMessages[error.code];
                        if (error.field) {
                            submissionErrors[error.field] = errorMessage;
                        } else {
                            submissionErrors[FORM_ERROR] = errorMessage;
                        }
                        return submissionErrors;
                    },
                    {} as Record<string, ReactNode>,
                );
            }

            const newId = mutationResponse?.create<EntityName>.<entityName>?.id;
            if (newId) {
                setTimeout(() => stackSwitchApi.activatePage("edit", newId));
            }
        }
    };

    if (error) throw error;
    if (loading) return <Loading behavior="fillPageHeight" />;

    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode={mode}
            initialValues={initialValues}
            initialValuesEqual={isEqual}
            subscription={{}}
        >
            {() => (
                <>
                    {saveConflict.dialogs}
                    {/* Fields go here */}
                </>
            )}
        </FinalForm>
    );
}
```
