import { gql, useQuery } from "@apollo/client";
import { Button, CopyField, Icon, KeyValueList, type KeyValueListItem, Panel, Skeleton, StatusIndicator, Switch, Typography } from "@dextinity/ui";
import type { MouseEvent, ReactNode } from "react";
import { useIntl } from "react-intl";

import type { DocumentInterface } from "../../documents/types";
import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import type { GQLPageTreeNodeDetailQuery, GQLPageTreeNodeDetailQueryVariables } from "./PageTreeNodeDetail.generated";
import { DetailActions, DetailContent, DetailHeading, DetailTitle } from "./PageTreeNodeDetail.sc";
import { usePageTreeStatusLabels, visibilityStatus } from "./pageTreeStatus";
import { canChangeVisibility } from "./usePageTreeDetailActions";

const pageTreeNodeDetailQuery = gql`
    query PageTreeNodeDetail($id: ID!) {
        pageTreeNode(id: $id) {
            id
            updatedAt
            numberOfDescendants
        }
    }
`;

interface PageTreeNodeDetailProps {
    page: GQLPageTreePageFragment;
    /** The names of the page's ancestors, from the topmost one down to its parent. */
    ancestorNames: string[];
    documentType?: DocumentInterface;
    siteUrl: string;
    editUrl: string;
    onEditClick: (event: MouseEvent<HTMLElement>) => void;
    onPreviewClick: () => void;
    onVisibilityChange: (visibility: GQLPageTreeNodeVisibility) => void;
    /** The menu with the page's other actions, e.g. `PageTreeNodeMenu`. */
    menu: ReactNode;
}

export function PageTreeNodeDetail({
    page,
    ancestorNames,
    documentType,
    siteUrl,
    editUrl,
    onEditClick,
    onPreviewClick,
    onVisibilityChange,
    menu,
}: PageTreeNodeDetailProps) {
    const intl = useIntl();
    const statusLabels = usePageTreeStatusLabels();
    const { data, loading } = useQuery<GQLPageTreeNodeDetailQuery, GQLPageTreeNodeDetailQueryVariables>(pageTreeNodeDetailQuery, {
        variables: { id: page.id },
        fetchPolicy: "cache-and-network",
    });
    const node = data?.pageTreeNode;

    const isArchived = page.visibility === "Archived";
    const isEditable = !isArchived && documentType?.editComponent != null;
    const hasPreview = !isArchived && documentType?.hasNoSitePreview !== true;

    const items: KeyValueListItem[] = [
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.status", defaultMessage: "Status" }),
            value: <StatusIndicator status={visibilityStatus[page.visibility]} labels={statusLabels} />,
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.documentType", defaultMessage: "Document type" }),
            value: documentType?.displayName ?? page.documentType,
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.updatedAt", defaultMessage: "Last updated" }),
            value:
                node != null ? (
                    intl.formatDate(node.updatedAt, { dateStyle: "medium", timeStyle: "short" })
                ) : loading ? (
                    <Skeleton width={120} />
                ) : (
                    "–"
                ),
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.subpages", defaultMessage: "Subpages" }),
            value: node != null ? intl.formatNumber(node.numberOfDescendants) : loading ? <Skeleton width={40} /> : "–",
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.slug", defaultMessage: "Slug" }),
            value: page.slug,
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.inMenu", defaultMessage: "In menu" }),
            value: page.hideInMenu
                ? intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.hiddenInMenu", defaultMessage: "Hidden" })
                : intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.shownInMenu", defaultMessage: "Shown" }),
        },
    ];

    return (
        <Panel title={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.selected", defaultMessage: "Selected" })} actions={menu}>
            <DetailContent>
                <DetailHeading>
                    {ancestorNames.length > 0 && <Typography variant="label">{ancestorNames.join(" › ")}</Typography>}
                    <DetailTitle>{page.name}</DetailTitle>
                    <CopyField
                        value={`${siteUrl}${page.path}`}
                        labels={{
                            copy: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.copyUrl", defaultMessage: "Copy URL" }),
                            copied: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.urlCopied", defaultMessage: "URL copied" }),
                        }}
                    />
                </DetailHeading>
                <DetailActions>
                    <Button startIcon={<Icon name="edit" />} href={editUrl} onClick={onEditClick} disabled={!isEditable}>
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.edit", defaultMessage: "Edit" })}
                    </Button>
                    <Button variant="outlined" color="secondary" startIcon={<Icon name="eye" />} onClick={onPreviewClick} disabled={!hasPreview}>
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.preview", defaultMessage: "Preview" })}
                    </Button>
                </DetailActions>
                <Switch
                    checked={page.visibility === "Published"}
                    onChange={(checked) => onVisibilityChange(checked ? "Published" : "Unpublished")}
                    disabled={!canChangeVisibility(page, page.visibility === "Published" ? "Unpublished" : "Published")}
                    description={
                        isArchived
                            ? intl.formatMessage({
                                  id: "dextinity.pageTreeDetail.detail.archivedDescription",
                                  defaultMessage: "Archived pages are hidden and can't be edited",
                              })
                            : page.visibility === "Published"
                              ? intl.formatMessage({
                                    id: "dextinity.pageTreeDetail.detail.liveDescription",
                                    defaultMessage: "Live at the address above.",
                                })
                              : intl.formatMessage({
                                    id: "dextinity.pageTreeDetail.detail.adminOnlyDescription",
                                    defaultMessage: "Only visible in the admin.",
                                })
                    }
                >
                    {statusLabels.published}
                </Switch>
                <KeyValueList items={items} />
            </DetailContent>
        </Panel>
    );
}
