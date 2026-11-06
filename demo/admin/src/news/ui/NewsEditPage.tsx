import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt, Stack } from "@dextinity/admin";
import { type BlockState, DamImageBlock, useContentScope } from "@dextinity/cms-admin";
import {
    Button,
    ConfirmDialog,
    EditLayout,
    EmptyState,
    formatShortcut,
    Icon,
    Input,
    isApplePlatform,
    KeyValueList,
    Link,
    PageHeader,
    Panel,
    SaveState,
    type SaveStateValue,
    Select,
    Skeleton,
    StatusIndicator,
    Switch,
    ToastViewport,
    Tooltip,
    useKeyboardShortcut,
    useToasts,
} from "@dextinity/ui";
import type { GQLNewsCategory, GQLNewsStatus } from "@src/graphql.generated";
import { deepEqual } from "fast-equals";
import { useEffect, useState } from "react";
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
import { useRouterLinkClick } from "./useRouterLinkClick";

interface NewsFormValues {
    title: string;
    slug: string;
    date: string;
    category: GQLNewsCategory | null;
    status: GQLNewsStatus;
    image: BlockState<typeof DamImageBlock>;
    content: BlockState<typeof NewsContentBlock>;
}

type NewsFormErrors = Partial<Record<"title" | "slug" | "date" | "category", string>>;

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
                    icon={<Icon name="warning" />}
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

interface NewsEditFormProps {
    baseUrl: string;
    news?: GQLNewsUiEditFragment;
}

function NewsEditForm({ baseUrl, news }: NewsEditFormProps) {
    const intl = useIntl();
    const history = useHistory();
    const client = useApolloClient();
    const navigateWithRouter = useRouterLinkClick();
    const formMatch = useRouteMatch();
    const { scope } = useContentScope();
    const [savedNews, setSavedNews] = useState(news);
    const [savedValues, setSavedValues] = useState<NewsFormValues>(() => (news ? toFormValues(news) : createEmptyFormValues()));
    const [values, setValues] = useState<NewsFormValues>(savedValues);
    const [errors, setErrors] = useState<NewsFormErrors>({});
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    const [savedAt, setSavedAt] = useState<Date | undefined>(news ? new Date(news.updatedAt) : undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [createdId, setCreatedId] = useState<string>();
    const [isDeleted, setIsDeleted] = useState(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    const isDirty = !deepEqual(values, savedValues);
    const shownSaveState: SaveStateValue = saveState === "saving" || saveState === "error" ? saveState : isDirty ? "dirty" : "saved";
    const listUrl = baseUrl;

    useEffect(() => {
        if (createdId && !isDirty) {
            history.replace(`${baseUrl}/${createdId}/edit`);
        }
    }, [createdId, isDirty, history, baseUrl]);

    useEffect(() => {
        if (isDeleted && !isDirty) {
            history.push(listUrl);
        }
    }, [isDeleted, isDirty, history, listUrl]);

    useEffect(() => {
        if (!isDirty) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [isDirty]);

    const setValue = <Key extends keyof NewsFormValues>(key: Key, value: NewsFormValues[Key]) => {
        setValues((current) => ({ ...current, [key]: value }));
        if (key in errors) {
            setErrors((current) => ({ ...current, [key]: undefined }));
        }
        if (saveState === "error") {
            setSaveState("saved");
        }
    };

    const validate = (): NewsFormErrors => {
        const requiredMessage = intl.formatMessage({ id: "uiDemo.news.edit.required", defaultMessage: "Required" });
        const nextErrors: NewsFormErrors = {};
        if (values.title.trim() === "") {
            nextErrors.title = requiredMessage;
        }
        if (values.slug.trim() === "") {
            nextErrors.slug = requiredMessage;
        } else if (!slugPattern.test(values.slug)) {
            nextErrors.slug = intl.formatMessage({
                id: "uiDemo.news.edit.slugInvalid",
                defaultMessage: "Use lowercase letters, digits, and hyphens, e.g. “company-anniversary”.",
            });
        }
        if (values.date === "") {
            nextErrors.date = requiredMessage;
        }
        if (values.category === null) {
            nextErrors.category = requiredMessage;
        }
        return nextErrors;
    };

    const save = async (): Promise<boolean> => {
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0 || values.category === null) {
            setSaveState("error");
            return false;
        }
        setSaveState("saving");
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
            setSavedAt(result ? new Date(result.updatedAt) : new Date());
            setSaveState("saved");
            addToast({
                message:
                    values.status === "active"
                        ? intl.formatMessage({ id: "uiDemo.news.edit.savedLive", defaultMessage: "Saved – the change is live" })
                        : intl.formatMessage({ id: "uiDemo.news.edit.saved", defaultMessage: "Saved" }),
            });
            return true;
        } catch (error) {
            setSaveState("error");
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.news.edit.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            });
            return false;
        }
    };

    useKeyboardShortcut("mod+s", () => void save(), { allowInEditable: true });

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
            setValues(savedValues);
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

    const title = savedNews?.title ?? intl.formatMessage({ id: "uiDemo.news.edit.newTitle", defaultMessage: "New news" });
    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");
    const isActive = values.status === "active";

    return (
        <RouterPrompt
            message={() =>
                isDirty ? intl.formatMessage({ id: "uiDemo.news.edit.unsavedChanges", defaultMessage: "Do you want to save your changes?" }) : true
            }
            saveAction={save}
            resetAction={() => setValues(savedValues)}
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
                                    state={shownSaveState}
                                    savedAt={savedAt}
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
                                    shortcut={saveShortcut}
                                >
                                    <Button
                                        startIcon={<Icon name="check" />}
                                        loading={saveState === "saving"}
                                        disabled={!isDirty && savedNews != null}
                                        onClick={() => void save()}
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
                                <Switch
                                    checked={isActive}
                                    onChange={(checked) => setValue("status", checked ? "active" : "deleted")}
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
                                </Switch>
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
                                <Input
                                    className={styles.fullWidth}
                                    name="title"
                                    label={intl.formatMessage({ id: "uiDemo.news.title", defaultMessage: "Title" })}
                                    required
                                    value={values.title}
                                    onChange={(event) => setValue("title", event.target.value)}
                                    state={errors.title ? "error" : "default"}
                                    validationMessage={errors.title}
                                />
                                <Input
                                    className={styles.fullWidth}
                                    name="slug"
                                    label={intl.formatMessage({ id: "uiDemo.news.slug", defaultMessage: "Slug" })}
                                    required
                                    prefix="/"
                                    value={values.slug}
                                    onChange={(event) => setValue("slug", event.target.value)}
                                    state={errors.slug ? "error" : "default"}
                                    validationMessage={errors.slug}
                                    helperText={intl.formatMessage({
                                        id: "uiDemo.news.edit.slugHelper",
                                        defaultMessage: "Part of the news URL; changing it breaks existing links.",
                                    })}
                                />
                                <Input
                                    name="date"
                                    type="date"
                                    label={intl.formatMessage({ id: "uiDemo.news.date", defaultMessage: "Date" })}
                                    required
                                    value={values.date}
                                    onChange={(event) => setValue("date", event.target.value)}
                                    state={errors.date ? "error" : "default"}
                                    validationMessage={errors.date}
                                />
                                <Select
                                    name="category"
                                    label={intl.formatMessage({ id: "uiDemo.news.category", defaultMessage: "Category" })}
                                    required
                                    placeholder={intl.formatMessage({
                                        id: "uiDemo.news.edit.categoryPlaceholder",
                                        defaultMessage: "Choose a category",
                                    })}
                                    value={values.category}
                                    onChange={(category) => setValue("category", category as GQLNewsCategory | null)}
                                    options={newsCategories.map((category) => ({ value: category, label: getNewsCategoryLabel(intl, category) }))}
                                    state={errors.category ? "error" : "default"}
                                    validationMessage={errors.category}
                                />
                            </div>
                        </section>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>{intl.formatMessage({ id: "uiDemo.news.edit.image", defaultMessage: "Image" })}</h3>
                            </div>
                            <div className={styles.block}>
                                <DamImageBlock.AdminComponent
                                    state={values.image}
                                    updateState={(image) => setValues(applyBlockUpdate("image", image))}
                                />
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
                                <NewsContentBlock.AdminComponent
                                    state={values.content}
                                    updateState={(content) => setValues(applyBlockUpdate("content", content))}
                                />
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
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.news.notifications", defaultMessage: "Notifications" }) }}
            />
        </RouterPrompt>
    );
}

type BlockUpdate<State> = State | ((previous: State) => State);

function applyBlockUpdate<Key extends "image" | "content">(key: Key, update: BlockUpdate<NewsFormValues[Key]>) {
    return (current: NewsFormValues): NewsFormValues => ({
        ...current,
        [key]: typeof update === "function" ? (update as (previous: NewsFormValues[Key]) => NewsFormValues[Key])(current[key]) : update,
    });
}
