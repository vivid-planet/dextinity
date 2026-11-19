import { skipToken, useApolloClient, useQuery } from "@apollo/client/react";
import {
    DatePickerField,
    Field,
    filterByFragment,
    FinalForm,
    type FinalFormSubmitEvent,
    Loading,
    RadioGroupField,
    TextField,
    useFormApiRef,
    useStackSwitchApi,
} from "@dextinity/admin";
import {
    AiModeFormScope,
    type BlockState,
    createFinalFormBlock,
    DamImageBlock,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useContentScope,
    useFormSaveConflict,
} from "@dextinity/cms-admin";
import { deepEqual } from "fast-equals";
import type { FormApi } from "final-form";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { NewsContentBlock, newsContentBlocks } from "./blocks/NewsContentBlock";
import { createNewsMutation, newsFormFragment, newsQuery, updateNewsMutation } from "./NewsForm.gql";
import type {
    GQLCreateNewsMutation,
    GQLCreateNewsMutationVariables,
    GQLNewsFormFragment,
    GQLNewsQuery,
    GQLNewsQueryVariables,
    GQLUpdateNewsMutation,
    GQLUpdateNewsMutationVariables,
} from "./NewsForm.gql.generated";

const rootBlocks = {
    image: DamImageBlock,
    content: NewsContentBlock,
};
type FormValues = Omit<GQLNewsFormFragment, "image" | "content"> & {
    image: BlockState<typeof rootBlocks.image>;
    content: BlockState<typeof rootBlocks.content>;
};
interface FormProps {
    onCreate?: (id: string) => void;
    id?: string;
}
export function NewsForm({ onCreate, id }: FormProps) {
    const client = useApolloClient();
    const intl = useIntl();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();
    const { scope } = useContentScope();
    const { data, error, loading, refetch } = useQuery<GQLNewsQuery, GQLNewsQueryVariables>(
        newsQuery,
        id ? { variables: { id }, notifyOnNetworkStatusChange: false } : skipToken,
    );
    const initialValues = useMemo<Partial<FormValues>>(
        () =>
            data?.news
                ? {
                      ...filterByFragment<GQLNewsFormFragment>(newsFormFragment, data.news),
                      image: rootBlocks.image.input2State(data.news.image),
                      content: rootBlocks.content.input2State(data.news.content),
                  }
                : {
                      image: rootBlocks.image.defaultValues(),
                      content: rootBlocks.content.defaultValues(),
                  },
        [data],
    );
    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "news", id);
            return resolveHasSaveConflict(data?.news.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });
    const handleSubmit = async (formValues: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }
        const output = {
            ...formValues,
            image: rootBlocks.image.state2Output(formValues.image),
            content: rootBlocks.content.state2Output(formValues.content),
        };
        if (mode === "edit") {
            if (!id) {
                throw new Error();
            }
            const { ...updateInput } = output;
            await client.mutate<GQLUpdateNewsMutation, GQLUpdateNewsMutationVariables>({
                mutation: updateNewsMutation,
                variables: { id, input: updateInput },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateNewsMutation, GQLCreateNewsMutationVariables>({
                mutation: createNewsMutation,
                variables: {
                    input: output,
                    scope,
                },
            });
            const id = mutationResponse?.createNews.id;
            if (id) {
                setTimeout(() => {
                    onCreate?.(id);
                    if (!event.navigatingBack) {
                        stackSwitchApi.activatePage(`edit`, id);
                    }
                });
            }
        }
    };
    if (error) {
        throw error;
    }
    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }
    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode={mode}
            initialValues={initialValues}
            initialValuesEqual={deepEqual} //required to compare block data correctly
            subscription={{}}
        >
            {() => (
                <>
                    {saveConflict.dialogs}
                    <AiModeFormScope
                        entityName="news"
                        entityLabel="news article"
                        id={id}
                        fields={[
                            { name: "slug", label: intl.formatMessage({ id: "news.slug", defaultMessage: "Slug" }), type: "text" },
                            { name: "title", label: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), type: "text" },
                            { name: "date", label: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }), type: "date" },
                            {
                                name: "category",
                                label: intl.formatMessage({ id: "news.category", defaultMessage: "Category" }),
                                type: "select",
                                options: [
                                    { value: "events", label: intl.formatMessage({ id: "news.category.events", defaultMessage: "Events" }) },
                                    { value: "company", label: intl.formatMessage({ id: "news.category.company", defaultMessage: "Company" }) },
                                    { value: "awards", label: intl.formatMessage({ id: "news.category.awards", defaultMessage: "Awards" }) },
                                ],
                            },
                            {
                                name: "image",
                                label: intl.formatMessage({ id: "news.image", defaultMessage: "Image" }),
                                type: "block",
                                block: rootBlocks.image,
                                schemaBlockName: "DamImage",
                            },
                            {
                                name: "content",
                                label: intl.formatMessage({ id: "news.content", defaultMessage: "Content" }),
                                type: "blocks",
                                block: rootBlocks.content,
                                supportedBlocks: newsContentBlocks,
                                schemaBlockName: "NewsContent",
                            },
                        ]}
                    />
                    <>
                        <TextField
                            required
                            variant="horizontal"
                            fullWidth
                            name="slug"
                            label={<FormattedMessage id="news.slug" defaultMessage="Slug" />}
                        />

                        <TextField
                            required
                            variant="horizontal"
                            fullWidth
                            name="title"
                            label={<FormattedMessage id="news.title" defaultMessage="Title" />}
                        />

                        <DatePickerField
                            required
                            variant="horizontal"
                            fullWidth
                            name="date"
                            label={<FormattedMessage id="news.date" defaultMessage="Date" />}
                        />
                        <RadioGroupField
                            required
                            variant="horizontal"
                            fullWidth
                            name="category"
                            label={<FormattedMessage id="news.category" defaultMessage="Category" />}
                            options={[
                                {
                                    label: <FormattedMessage id="news.category.events" defaultMessage="Events" />,
                                    value: "events",
                                },
                                {
                                    label: <FormattedMessage id="news.category.company" defaultMessage="Company" />,
                                    value: "company",
                                },
                                {
                                    label: <FormattedMessage id="news.category.awards" defaultMessage="Awards" />,
                                    value: "awards",
                                },
                            ]}
                        />
                        <Field
                            name="image"
                            isEqual={deepEqual}
                            label={<FormattedMessage id="news.image" defaultMessage="Image" />}
                            variant="horizontal"
                            fullWidth
                        >
                            {createFinalFormBlock(rootBlocks.image)}
                        </Field>
                        <Field
                            name="content"
                            isEqual={deepEqual}
                            label={<FormattedMessage id="news.content" defaultMessage="Content" />}
                            variant="horizontal"
                            fullWidth
                        >
                            {createFinalFormBlock(rootBlocks.content)}
                        </Field>
                    </>
                </>
            )}
        </FinalForm>
    );
}
