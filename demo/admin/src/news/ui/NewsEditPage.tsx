import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt, Stack } from "@dextinity/admin";
import {
    type BlockState,
    createFinalFormBlock,
    DamImageBlock,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useContentScope,
    useDatePickerLabels,
    useRouterLinkClick,
} from "@dextinity/cms-admin";
import {
    Button,
    ConfirmDialog,
    EditLayout,
    EmptyState,
    Icon,
    KeyValueList,
    Link,
    type NewToast,
    PageHeader,
    Panel,
    SaveState,
    Skeleton,
    StatusIndicator,
    ToastViewport,
    Tooltip,
    useKeyboardShortcut,
    useToasts,
} from "@dextinity/ui";
import {
    DateField,
    focusOnError,
    InputField,
    SelectField,
    SwitchField,
    useFormSaveState,
    useHasUnsavedChanges,
} from "@dextinity/ui-react-final-form";
import type { GQLNewsCategory, GQLNewsStatus } from "@src/graphql.generated";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { useEffect, useRef, useState } from "react";
import { Field, Form, useField } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router";

import { NewsContentBlock } from "../blocks/NewsContentBlock";
import { createNewsMutation, deleteNewsMutation, newsEditQuery, updateNewsMutation } from "./NewsEditPage.gql";
import type {
    GQLNewsUiCreateMutation,
    GQLNewsUiCreateMutationVariables,
    GQLNewsUiEditDeleteMutation,
    GQLNewsUiEditDeleteMutationVariables,
    GQLNewsUiEditFragment,
    GQLNewsUiEditQuery,
    GQLNewsUiEditQueryVariables,
    GQLNewsUiUpdateMutation,
    GQLNewsUiUpdateMutationVariables,
} from "./NewsEditPage.gql.generated";
import styles from "./NewsEditPage.module.css";
import { getNewsCategoryLabel, getNewsStatusIndicator, getNewsStatusLabel, newsCategories } from "./newsLabels";

interface NewsFormValues {
    title: string;
    slug: string;
    date: string;
    category: GQLNewsCategory | null;
    status: GQLNewsStatus;
    image: BlockState<typeof DamImageBlock>;
    content: BlockState<typeof NewsContentBlock>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toDateInputValue(dateTime: string) {
    const date = new Date(dateTime);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function toFormValues(news: GQLNewsUiEditFragment): NewsFormValues {
    return {
        title: news.title,
        slug: news.slug,
        date: toDateInputValue(news.date),
        category: news.category,
        status: news.status,
        image: DamImageBlock.input2State(news.image),
        content: NewsContentBlock.input2State(news.content),
    };
}

function createEmptyFormValues(): NewsFormValues {
    return {
        title: "",
        slug: "",
        date: toDateInputValue(new Date().toISOString()),
        category: null,
        status: "active",
        image: DamImageBlock.defaultValues(),
        content: NewsContentBlock.defaultValues(),
    };
}

interface NewsEditPageProps {
    baseUrl: string;
    id?: string;
}

export function NewsEditPage({ baseUrl, id }: NewsEditPageProps) {
    const intl = useIntl();
    const { data, error, loading } = useQuery<GQLNewsUiEditQuery, GQLNewsUiEditQueryVariables>(
        newsEditQuery,
        id ? { variables: { id }, context: LocalErrorScopeApolloContext } : { skip: true },
    );

    if (error) {
        return <NewsLoadError baseUrl={baseUrl} reason={error.message} />;
    }

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "uiDemo.news.list.title", defaultMessage: "News" })}>
            {loading || (id && !data) ? <NewsEditSkeleton /> : <NewsEditForm baseUrl={baseUrl} news={data?.news} />}
        </Stack>
    );
}

interface NewsLoadErrorProps {
    baseUrl: string;
    reason: string;
}

function NewsLoadError({ baseUrl, reason }: NewsLoadErrorProps) {
    const intl = useIntl();
    const navigateWithRouter = useRouterLinkClick();
    return (
        <EditLayout
            header={
                <PageHeader
                    back={{ label: intl.formatMessage({ id: "uiDemo.news.list.title", defaultMessage: "News" }), href: baseUrl }}
                    slotProps={{ back: { onClick: navigateWithRouter } }}
                    title={intl.formatMessage({ id: "uiDemo.news.edit.loadFailed", defaultMessage: "This news can't be opened" })}
                />
            }
        >
            <Panel>
                <EmptyState
                    icon={<Icon name="warning-triangle" />}
                    title={reason}
                    actions={
                        <Button variant="outlined" color="secondary" size="small" href={baseUrl} onClick={navigateWithRouter}>
                            {intl.formatMessage({ id: "uiDemo.news.edit.backToList", defaultMessage: "Back to the news" })}
                        </Button>
                    }
                />
            </Panel>
        </EditLayout>
    );
}

function NewsEditSkeleton() {
    return (
        <EditLayout header={<Skeleton variant="text" width="40%" />}>
            <Panel>
                <Skeleton variant="row" count={4} />
            </Panel>
        </EditLayout>
    );
}

const FinalFormDamImageBlock = createFinalFormBlock(DamImageBlock);
const FinalFormNewsContentBlock = createFinalFormBlock(NewsContentBlock);
const formDecorators = [focusOnError];

interface NewsEditFormProps {
    baseUrl: string;
    news?: GQLNewsUiEditFragment;
}

function NewsEditForm({ baseUrl, news }: NewsEditFormProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { scope } = useContentScope();
    const [savedNews, setSavedNews] = useState(news);
    const [savedValues, setSavedValues] = useState<NewsFormValues>(() => (news ? toFormValues(news) : createEmptyFormValues()));
    const [createdId, setCreatedId] = useState<string>();
    const shouldOverwriteNewerVersion = useRef(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    const save = async (values: NewsFormValues, form: FormApi<NewsFormValues>): Promise<SubmissionErrors | undefined> => {
        const overwriteNewerVersion = shouldOverwriteNewerVersion.current;
        shouldOverwriteNewerVersion.current = false;
        if (values.category === null) {
            return { category: intl.formatMessage({ id: "uiDemo.news.edit.required", defaultMessage: "Required" }) };
        }
        const input = {
            title: values.title,
            slug: values.slug,
            date: values.date,
            category: values.category,
            status: values.status,
            image: DamImageBlock.state2Output(values.image),
            content: NewsContentBlock.state2Output(values.content),
        };
        try {
            if (savedNews && !overwriteNewerVersion) {
                const currentUpdatedAt = await queryUpdatedAt(client, "news", savedNews.id);
                if (resolveHasSaveConflict(savedNews.updatedAt, currentUpdatedAt)) {
                    const conflictMessage = intl.formatMessage({
                        id: "uiDemo.news.edit.saveConflict",
                        defaultMessage: "Not saved: someone else saved this news in the meantime",
                    });
                    addToast({
                        tone: "error",
                        message: conflictMessage,
                        action: {
                            label: intl.formatMessage({ id: "uiDemo.news.edit.overwrite", defaultMessage: "Overwrite" }),
                            onClick: () => {
                                shouldOverwriteNewerVersion.current = true;
                                void form.submit();
                            },
                        },
                    });
                    return { [FORM_ERROR]: conflictMessage };
                }
            }
            let result: GQLNewsUiEditFragment | undefined;
            if (savedNews) {
                const { data } = await client.mutate<GQLNewsUiUpdateMutation, GQLNewsUiUpdateMutationVariables>({
                    mutation: updateNewsMutation,
                    variables: { id: savedNews.id, input },
                    context: LocalErrorScopeApolloContext,
                });
                result = data?.updateNews;
            } else {
                const { data } = await client.mutate<GQLNewsUiCreateMutation, GQLNewsUiCreateMutationVariables>({
                    mutation: createNewsMutation,
                    variables: { scope, input },
                    context: LocalErrorScopeApolloContext,
                });
                result = data?.createNews;
                if (result) {
                    setCreatedId(result.id);
                }
            }
            setSavedNews(result);
            setSavedValues(values);
            addToast({
                message:
                    values.status === "active"
                        ? intl.formatMessage({ id: "uiDemo.news.edit.savedLive", defaultMessage: "Saved – the change is live" })
                        : intl.formatMessage({ id: "uiDemo.news.edit.saved", defaultMessage: "Saved" }),
            });
            return undefined;
        } catch (error) {
            const failureMessage = intl.formatMessage(
                { id: "uiDemo.news.edit.saveFailed", defaultMessage: "Saving failed: {reason}" },
                { reason: error instanceof Error ? error.message : String(error) },
            );
            addToast({ tone: "error", message: failureMessage });
            return { [FORM_ERROR]: failureMessage };
        }
    };

    return (
        <>
            <Form<NewsFormValues> onSubmit={save} initialValues={savedValues} keepDirtyOnReinitialize decorators={formDecorators}>
                {({ handleSubmit, form }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <NewsEditFormContent baseUrl={baseUrl} savedNews={savedNews} createdId={createdId} form={form} addToast={addToast} />
                    </form>
                )}
            </Form>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.news.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface NewsEditFormContentProps {
    baseUrl: string;
    savedNews?: GQLNewsUiEditFragment;
    createdId?: string;
    form: FormApi<NewsFormValues>;
    addToast: (toast: NewToast) => void;
}

function NewsEditFormContent({ baseUrl, savedNews, createdId, form, addToast }: NewsEditFormContentProps) {
    const intl = useIntl();
    const history = useHistory();
    const client = useApolloClient();
    const navigateWithRouter = useRouterLinkClick();
    const formMatch = useRouteMatch();
    const { state: saveState } = useFormSaveState();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const {
        input: { value: status },
    } = useField<GQLNewsStatus>("status", { subscription: { value: true } });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const listUrl = baseUrl;

    useEffect(() => {
        if (createdId && !hasUnsavedChanges) {
            history.replace(`${baseUrl}/${createdId}/edit`);
        }
    }, [createdId, hasUnsavedChanges, history, baseUrl]);

    useEffect(() => {
        if (isDeleted && !hasUnsavedChanges) {
            history.push(listUrl);
        }
    }, [isDeleted, hasUnsavedChanges, history, listUrl]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasUnsavedChanges]);

    const submitAndReportSuccess = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        return !hasValidationErrors && !hasSubmitErrors;
    };

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    const deletePermanently = async () => {
        if (!savedNews) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLNewsUiEditDeleteMutation, GQLNewsUiEditDeleteMutationVariables>({
                mutation: deleteNewsMutation,
                variables: { id: savedNews.id },
                context: LocalErrorScopeApolloContext,
                update: (cache) => cache.evict({ id: cache.identify({ __typename: "News", id: savedNews.id }) }),
            });
            form.reset();
            setDeleteDialogOpen(false);
            setIsDeleted(true);
        } catch {
            setDeleting(false);
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "uiDemo.news.edit.deleteFailed", defaultMessage: "Deleting failed · the news still exists" }),
            });
        }
    };

    const requiredMessage = intl.formatMessage({ id: "uiDemo.news.edit.required", defaultMessage: "Required" });
    const datePickerLabels = useDatePickerLabels();
    const validateTitle = (title: string) => (title.trim() === "" ? requiredMessage : undefined);
    const validateSlug = (slug: string) =>
        slugPattern.test(slug)
            ? undefined
            : intl.formatMessage({
                  id: "uiDemo.news.edit.slugInvalid",
                  defaultMessage: "Use lowercase letters, digits, and hyphens, e.g. “company-anniversary”.",
              });

    const title = savedNews?.title ?? intl.formatMessage({ id: "uiDemo.news.edit.newTitle", defaultMessage: "New news" });
    const isActive = status === "active";

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "uiDemo.news.edit.unsavedChanges", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={submitAndReportSuccess}
            resetAction={() => form.reset()}
            subRoutePath="./form"
        >
            <EditLayout
                variant="form"
                header={
                    <PageHeader
                        back={{
                            label: intl.formatMessage({ id: "uiDemo.news.list.title", defaultMessage: "News" }),
                            href: listUrl,
                        }}
                        slotProps={{ back: { onClick: navigateWithRouter } }}
                        title={title}
                        subtitle={
                            savedNews ? (
                                <span className={styles.metaLine}>
                                    <StatusIndicator status={getNewsStatusIndicator(savedNews.status)}>
                                        {getNewsStatusLabel(intl, savedNews.status)}
                                    </StatusIndicator>
                                    <span>{`/${savedNews.slug}`}</span>
                                </span>
                            ) : undefined
                        }
                        actions={
                            <>
                                <SaveState
                                    state={saveState}
                                    savedAt={savedNews ? new Date(savedNews.updatedAt) : undefined}
                                    locale={intl.locale}
                                    labels={{
                                        saved: intl.formatMessage({ id: "uiDemo.news.edit.saveState.saved", defaultMessage: "Saved" }),
                                        dirty: intl.formatMessage({ id: "uiDemo.news.edit.saveState.dirty", defaultMessage: "Unsaved changes" }),
                                        saving: intl.formatMessage({ id: "uiDemo.news.edit.saveState.saving", defaultMessage: "Saving …" }),
                                        error: intl.formatMessage({ id: "uiDemo.news.edit.saveState.error", defaultMessage: "Not saved" }),
                                        savedAt: intl.formatMessage({ id: "uiDemo.news.edit.saveState.savedAt", defaultMessage: "Last saved" }),
                                    }}
                                />
                                <Tooltip
                                    content={
                                        isActive
                                            ? intl.formatMessage({
                                                  id: "uiDemo.news.edit.saveTooltipLive",
                                                  defaultMessage: "The news is active: saving puts the change live",
                                              })
                                            : intl.formatMessage({ id: "uiDemo.news.edit.saveTooltip", defaultMessage: "Saves the news" })
                                    }
                                    shortcut="mod+s"
                                >
                                    <Button
                                        type="submit"
                                        startIcon={<Icon name="check" />}
                                        loading={saveState === "saving"}
                                        disabled={!hasUnsavedChanges && savedNews != null}
                                    >
                                        {intl.formatMessage({ id: "uiDemo.news.edit.save", defaultMessage: "Save" })}
                                    </Button>
                                </Tooltip>
                            </>
                        }
                    />
                }
                aside={
                    <div className={styles.aside}>
                        <Panel title={intl.formatMessage({ id: "uiDemo.news.edit.statusPanel", defaultMessage: "Status" })}>
                            <div className={styles.asideBody}>
                                <SwitchField<GQLNewsStatus>
                                    name="status"
                                    format={(fieldStatus) => fieldStatus === "active"}
                                    parse={(checked) => (checked ? "active" : "deleted")}
                                    description={
                                        isActive
                                            ? intl.formatMessage({
                                                  id: "uiDemo.news.edit.activeDescription",
                                                  defaultMessage: "Shown on the site after saving.",
                                              })
                                            : intl.formatMessage({
                                                  id: "uiDemo.news.edit.deletedDescription",
                                                  defaultMessage: "Marked as deleted: hidden on the site, kept in the admin.",
                                              })
                                    }
                                >
                                    {intl.formatMessage({ id: "uiDemo.news.status.active", defaultMessage: "Active" })}
                                </SwitchField>
                                {savedNews && (
                                    <KeyValueList
                                        items={[
                                            {
                                                key: intl.formatMessage({ id: "uiDemo.news.edit.currentStatus", defaultMessage: "Current" }),
                                                value: (
                                                    <StatusIndicator status={getNewsStatusIndicator(savedNews.status)}>
                                                        {getNewsStatusLabel(intl, savedNews.status)}
                                                    </StatusIndicator>
                                                ),
                                            },
                                            {
                                                key: intl.formatMessage({ id: "uiDemo.news.edit.createdAt", defaultMessage: "Created" }),
                                                value: <FormattedDate value={savedNews.createdAt} dateStyle="medium" timeStyle="short" />,
                                            },
                                            {
                                                key: intl.formatMessage({ id: "uiDemo.news.edit.updatedAt", defaultMessage: "Saved" }),
                                                value: <FormattedDate value={savedNews.updatedAt} dateStyle="medium" timeStyle="short" />,
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                        </Panel>
                        {savedNews && (
                            <Panel
                                title={intl.formatMessage({ id: "uiDemo.news.edit.dangerPanel", defaultMessage: "Delete" })}
                                description={intl.formatMessage({
                                    id: "uiDemo.news.edit.dangerDescription",
                                    defaultMessage: "To only hide the news, switch off “Active”.",
                                })}
                            >
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Icon name="trash" />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    {intl.formatMessage({ id: "uiDemo.news.edit.delete", defaultMessage: "Delete permanently" })}
                                </Button>
                            </Panel>
                        )}
                    </div>
                }
                asideLabel={intl.formatMessage({ id: "uiDemo.news.edit.statusPanel", defaultMessage: "Status" })}
            >
                <Panel>
                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>{intl.formatMessage({ id: "uiDemo.news.edit.basics", defaultMessage: "Basics" })}</h3>
                                <p>
                                    {intl.formatMessage({
                                        id: "uiDemo.news.edit.basicsDescription",
                                        defaultMessage: "These details appear in the news list and on the site.",
                                    })}
                                </p>
                            </div>
                            <div className={styles.fields}>
                                <InputField
                                    className={styles.fullWidth}
                                    name="title"
                                    label={intl.formatMessage({ id: "uiDemo.news.title", defaultMessage: "Title" })}
                                    required
                                    requiredMessage={requiredMessage}
                                    validate={validateTitle}
                                />
                                <InputField
                                    className={styles.fullWidth}
                                    name="slug"
                                    label={intl.formatMessage({ id: "uiDemo.news.slug", defaultMessage: "Slug" })}
                                    required
                                    requiredMessage={requiredMessage}
                                    validate={validateSlug}
                                    prefix="/"
                                    helperText={intl.formatMessage({
                                        id: "uiDemo.news.edit.slugHelper",
                                        defaultMessage: "Part of the news URL; changing it breaks existing links.",
                                    })}
                                />
                                <DateField
                                    name="date"
                                    label={intl.formatMessage({ id: "uiDemo.news.date", defaultMessage: "Date" })}
                                    locale={intl.locale}
                                    labels={datePickerLabels}
                                    required
                                    requiredMessage={requiredMessage}
                                />
                                <SelectField
                                    name="category"
                                    label={intl.formatMessage({ id: "uiDemo.news.category", defaultMessage: "Category" })}
                                    required
                                    requiredMessage={requiredMessage}
                                    placeholder={intl.formatMessage({
                                        id: "uiDemo.news.edit.categoryPlaceholder",
                                        defaultMessage: "Choose a category",
                                    })}
                                    options={newsCategories.map((category) => ({ value: category, label: getNewsCategoryLabel(intl, category) }))}
                                />
                            </div>
                        </section>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>{intl.formatMessage({ id: "uiDemo.news.edit.image", defaultMessage: "Image" })}</h3>
                            </div>
                            <div className={styles.block}>
                                <Field name="image" component={FinalFormDamImageBlock} isEqual={deepEqual} />
                            </div>
                        </section>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>{intl.formatMessage({ id: "uiDemo.news.edit.content", defaultMessage: "Content" })}</h3>
                                <p>
                                    {intl.formatMessage({
                                        id: "uiDemo.news.edit.contentDescription",
                                        defaultMessage: "The article's blocks. Open a block to edit it.",
                                    })}
                                </p>
                                {!formMatch.isExact && (
                                    <Link href={formMatch.url} onClick={navigateWithRouter} startIcon={<Icon name="arrow-left" />}>
                                        {intl.formatMessage({ id: "uiDemo.news.edit.backToBlocks", defaultMessage: "All blocks" })}
                                    </Link>
                                )}
                            </div>
                            <div className={styles.block}>
                                <Field name="content" component={FinalFormNewsContentBlock} isEqual={deepEqual} />
                            </div>
                        </section>
                    </div>
                </Panel>
            </EditLayout>
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setDeleteDialogOpen(open);
                    }
                }}
                tone="danger"
                title={intl.formatMessage({ id: "uiDemo.news.edit.deleteDialog.title", defaultMessage: "Delete “{title}” permanently?" }, { title })}
                description={intl.formatMessage({
                    id: "uiDemo.news.edit.deleteDialog.description",
                    defaultMessage: "This can't be undone. To hide the news from the site and keep it, switch off “Active” instead.",
                })}
                confirmLabel={intl.formatMessage({ id: "uiDemo.news.edit.delete", defaultMessage: "Delete permanently" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={() => void deletePermanently()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "uiDemo.news.list.deleteDialog.cancel", defaultMessage: "Cancel" }) }}
            />
        </RouterPrompt>
    );
}
