import { gql, useMutation } from "@apollo/client";
import {
    Button,
    FillSpace,
    MainContent,
    messages,
    RouterPrompt,
    SaveButton,
    Toolbar,
    ToolbarActions,
    ToolbarBackButton,
    ToolbarTitleItem,
} from "@dextinity/admin";
import { Add, Delete, Preview } from "@dextinity/admin-icons";
import {
    BlockAdminComponentRoot,
    type BlockOutputApi,
    type BlockState,
    ContentScopeIndicator,
    HiddenInSubroute,
    IFrameBridgeProvider,
    openSitePreviewWindow,
    resolveNewState,
    SplitPreview,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Box } from "@mui/material";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import isEqual from "lodash.isequal";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouteMatch } from "react-router-dom";

import type {
    GQLEditMainMenuItemFragment,
    GQLUpdateMainMenuItemMutation,
    GQLUpdateMainMenuItemMutationVariables,
} from "./EditMainMenuItem.generated";

export type { GQLEditMainMenuItemFragment } from "./EditMainMenuItem.generated"; // re-export

export const editMainMenuItemFragment = gql`
    fragment EditMainMenuItem on MainMenuItem {
        id
        node {
            id
            name
            path
        }
        content
        updatedAt
    }
`;

const updateMainMenuItemMutation = gql`
    mutation UpdateMainMenuItem($pageTreeNodeId: ID!, $lastUpdatedAt: DateTime, $input: MainMenuItemInput!) {
        updateMainMenuItem(pageTreeNodeId: $pageTreeNodeId, lastUpdatedAt: $lastUpdatedAt, input: $input) {
            id
            content
            updatedAt
        }
    }
`;

interface EditMainMenuItemProps {
    item: GQLEditMainMenuItemFragment;
}

type RichTextBlockState = BlockState<typeof RichTextBlock>;
type RichTextBlockOutput = BlockOutputApi<typeof RichTextBlock>;

const EditMainMenuItem = ({ item }: EditMainMenuItemProps) => {
    const previewApi = useBlockPreview();
    const match = useRouteMatch();
    const [updateMainMenuItem, { loading: saving, error: saveError }] = useMutation<
        GQLUpdateMainMenuItemMutation,
        GQLUpdateMainMenuItemMutationVariables
    >(updateMainMenuItemMutation);
    const [referenceContent, setReferenceContent] = useState<RichTextBlockOutput | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [content, setContent] = useState<RichTextBlockState | null>(null);
    const { match: contentScopeMatch, scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const intl = useIntl();
    const blockContext = useBlockContext();

    useEffect(() => {
        setContent(item.content ? RichTextBlock.input2State(item.content) : null);
        setReferenceContent(item.content ? RichTextBlock.state2Output(RichTextBlock.input2State(item.content)) : null);
    }, [item]);

    useEffect(() => {
        const equal = isEqual(referenceContent, content ? RichTextBlock.state2Output(content) : null);
        setHasChanges(!equal);
    }, [content, referenceContent]);
    let previewState = undefined;

    if (content) {
        previewState = RichTextBlock.createPreviewState(content, {
            ...blockContext,
            parentUrl: match.url,
            showVisibleOnly: previewApi.showOnlyVisible,
        });
    }

    const handleAddContentClick = () => {
        setContent(RichTextBlock.defaultValues());
    };

    const handleRemoveContentClick = () => {
        setContent(null);
    };

    const handleSaveClick = async () => {
        await updateMainMenuItem({
            variables: {
                pageTreeNodeId: item.node.id,
                input: { content: content ? RichTextBlock.state2Output(content) : null },
                lastUpdatedAt: item.updatedAt,
            },
            refetchQueries: ["MainMenuItem"],
        });
    };

    const handleSaveAction = async () => {
        try {
            await handleSaveClick();
            return true;
        } catch {
            return false;
        }
    };

    return (
        <>
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarBackButton />
                <ToolbarTitleItem>{item?.node?.name}</ToolbarTitleItem>
                <FillSpace />
                <ToolbarActions>
                    <Button
                        variant="textDark"
                        startIcon={<Preview />}
                        onClick={() => {
                            openSitePreviewWindow(item.node.path, contentScopeMatch.url);
                        }}
                    >
                        <FormattedMessage id="pages.pages.page.edit.preview" defaultMessage="Site preview" />
                    </Button>
                    <SaveButton disabled={!hasChanges} loading={saving} hasErrors={saveError != null} onClick={handleSaveClick} />
                </ToolbarActions>
            </Toolbar>
            {hasChanges && (
                <RouterPrompt
                    message={(location) => {
                        if (location.pathname.startsWith(match.url)) {
                            return true;
                        } //we navigated within our self
                        return intl.formatMessage(messages.saveUnsavedChanges);
                    }}
                    saveAction={handleSaveAction}
                />
            )}
            <MainContent>
                <IFrameBridgeProvider>
                    <SplitPreview url={`${siteConfig.blockPreviewBaseUrl}/main-menu`} previewState={previewState} previewApi={previewApi}>
                        <div>
                            {content ? (
                                <BlockAdminComponentRoot title={intl.formatMessage({ id: "mainMenu.menuItem", defaultMessage: "Menu item" })}>
                                    <RichTextBlock.AdminComponent
                                        state={content}
                                        updateState={(setStateAction) => {
                                            setContent(resolveNewState({ prevState: content, setStateAction }));
                                        }}
                                    />
                                    <HiddenInSubroute>
                                        <Box mb={4} />
                                        <Button variant="destructive" startIcon={<Delete />} onClick={handleRemoveContentClick}>
                                            <FormattedMessage id="mainMenu.removeContent" defaultMessage="Remove content" />
                                        </Button>
                                    </HiddenInSubroute>
                                </BlockAdminComponentRoot>
                            ) : (
                                <Button startIcon={<Add />} onClick={handleAddContentClick}>
                                    <FormattedMessage id="mainMenu.addContent" defaultMessage="Add content" />
                                </Button>
                            )}
                        </div>
                    </SplitPreview>
                </IFrameBridgeProvider>
            </MainContent>
        </>
    );
};

export default EditMainMenuItem;
