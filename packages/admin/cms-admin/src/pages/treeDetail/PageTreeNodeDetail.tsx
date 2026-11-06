import { gql, useQuery } from "@apollo/client";
import {
    Button,
    CopyField,
    Icon,
    IconButton,
    KeyValueList,
    type KeyValueListItem,
    Menu,
    MenuItem,
    MenuSeparator,
    Panel,
    Skeleton,
    StatusIndicator,
    Switch,
} from "@dextinity/ui";
import { type MouseEvent, useState } from "react";
import { useIntl } from "react-intl";

import type { DocumentInterface } from "../../documents/types";
import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import type { GQLPageTreeNodeDetailQuery, GQLPageTreeNodeDetailQueryVariables } from "./PageTreeNodeDetail.generated";
import { DetailActions, DetailContent } from "./PageTreeNodeDetail.sc";
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
    documentType?: DocumentInterface;
    siteUrl: string;
    editUrl: string;
    onEditClick: (event: MouseEvent<HTMLElement>) => void;
    onPreviewClick: () => void;
    onVisibilityChange: (visibility: GQLPageTreeNodeVisibility) => void;
    onPropertiesClick: () => void;
    onAddSubpageClick: () => void;
}

export function PageTreeNodeDetail({
    page,
    documentType,
    siteUrl,
    editUrl,
    onEditClick,
    onPreviewClick,
    onVisibilityChange,
    onPropertiesClick,
    onAddSubpageClick,
}: PageTreeNodeDetailProps) {
    const intl = useIntl();
    const statusLabels = usePageTreeStatusLabels();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
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
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.slug", defaultMessage: "Slug" }),
            value: page.slug,
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.inMenu", defaultMessage: "In menu" }),
            value: page.hideInMenu
                ? intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.hiddenInMenu", defaultMessage: "Hidden" })
                : intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.shownInMenu", defaultMessage: "Shown" }),
        },
        {
            key: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.subpages", defaultMessage: "Subpages" }),
            value: node != null ? intl.formatNumber(node.numberOfDescendants) : loading ? <Skeleton width={40} /> : "–",
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
    ];

    return (
        <Panel
            title={page.name}
            actions={
                <Menu
                    open={isMoreMenuOpen}
                    onOpenChange={setIsMoreMenuOpen}
                    placement="bottom-end"
                    trigger={
                        <IconButton
                            variant="text"
                            aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.moreActions", defaultMessage: "More actions" })}
                        >
                            <Icon name="more" />
                        </IconButton>
                    }
                >
                    <MenuItem
                        icon={<Icon name="settings" />}
                        label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.properties", defaultMessage: "Page properties" })}
                        disabled={isArchived}
                        onClick={onPropertiesClick}
                    />
                    <MenuItem
                        icon={<Icon name="plus" />}
                        label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.addSubpage", defaultMessage: "New subpage" })}
                        disabled={isArchived}
                        onClick={onAddSubpageClick}
                    />
                    <MenuSeparator />
                    {isArchived ? (
                        <MenuItem
                            icon={<Icon name="refresh" />}
                            label={intl.formatMessage({
                                id: "dextinity.pageTreeDetail.detail.restore",
                                defaultMessage: "Restore as unpublished",
                            })}
                            onClick={() => onVisibilityChange("Unpublished")}
                        />
                    ) : (
                        <MenuItem
                            icon={<Icon name="archive" />}
                            label={intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.archive", defaultMessage: "Archive with subpages" })}
                            color="error"
                            disabled={!canChangeVisibility(page, "Archived")}
                            onClick={() => onVisibilityChange("Archived")}
                        />
                    )}
                </Menu>
            }
            description={
                <CopyField
                    value={`${siteUrl}${page.path}`}
                    labels={{
                        copy: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.copyUrl", defaultMessage: "Copy URL" }),
                        copied: intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.urlCopied", defaultMessage: "URL copied" }),
                    }}
                />
            }
        >
            <DetailContent>
                <DetailActions>
                    <Button startIcon={<Icon name="edit" />} href={editUrl} onClick={onEditClick} disabled={!isEditable}>
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.editContent", defaultMessage: "Edit content" })}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icon name="external-link" />}
                        onClick={onPreviewClick}
                        disabled={!hasPreview}
                    >
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.detail.openPreview", defaultMessage: "Open preview" })}
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
                            : intl.formatMessage({
                                  id: "dextinity.pageTreeDetail.detail.publishedDescription",
                                  defaultMessage: "Visible on the website",
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
