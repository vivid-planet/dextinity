import {
    Alert,
    FillSpace,
    Loading,
    MainContent,
    RouterPrompt,
    RouterTab,
    RouterTabs,
    SaveButton,
    StackToolbar,
    ToolbarActions,
    ToolbarBackButton,
    ToolbarItem,
    useSnackbarApi,
} from "@dextinity/admin";
import {
    BlockAdminComponentRoot,
    BlockAdminTabLabel,
    type BlockContext,
    BlockPreviewWithTabs,
    resolveNewState,
    useBlockContext,
    useBlockPreview,
} from "@dextinity/cms-admin";
import { getErrorMessage } from "@dextinity/serverless-core/client";
import { Snackbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { createElement, type Dispatch, type ReactNode, type SetStateAction, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { pageTreeQueryKeys } from "./pageTreeApi.types.js";
import { type PageTreeRootBlock, usePageTreeApi } from "./PageTreeApiProvider.js";

type RootBlocks = Record<string, PageTreeRootBlock>;
type DocumentState = Record<string, unknown>;

function documentOutput(rootBlocks: RootBlocks, state: DocumentState): Record<string, unknown> {
    return Object.fromEntries(Object.entries(rootBlocks).map(([key, { block }]) => [key, block.state2Output(state[key])]));
}

/** A new document, or one saved before the root block was added, gets the root block's default values */
async function documentState(rootBlocks: RootBlocks, data: Record<string, unknown> | null, context: BlockContext): Promise<DocumentState> {
    return Object.fromEntries(
        await Promise.all(
            Object.entries(rootBlocks).map(async ([key, { block }]) => [
                key,
                data?.[key] !== undefined ? await block.output2State(data[key], context) : block.defaultValues(),
            ]),
        ),
    );
}

/** The root block whose preview a tab shows: its own, or the first root block's with a preview */
function previewedRootBlockKey(rootBlocks: RootBlocks, tabKey: string | undefined): string | undefined {
    if (tabKey && rootBlocks[tabKey]?.previewPath) {
        return tabKey;
    }
    return Object.keys(rootBlocks).find((key) => rootBlocks[key].previewPath);
}

/**
 * An unsecured JWT (`alg: none`, RFC 7519) with the scope, which the site's block preview reads the scope from. The NestJS API signs it
 * for the site's requests to the API in the preview; the serverless API has no read API for the site yet, so nothing verifies it.
 */
function createUnsecuredScopeJwt(scope: object): string {
    const encode = (value: object) =>
        btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
            .replace(/=+$/, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    return `${encode({ alg: "none", typ: "JWT" })}.${encode({ scope })}.`;
}

/** Edits the document of a page tree node with the root blocks of its document type, one tab per root block */
export function PageTreeDocumentEditor({ id }: { id: string }) {
    const { client, documentTypes } = usePageTreeApi();
    const blockContext = useBlockContext();
    const { data: node } = useQuery({
        queryKey: pageTreeQueryKeys.node(id),
        queryFn: () => parseResponse(client.nodes[":id"].$get({ param: { id } })),
    });
    const { data: document } = useQuery({
        queryKey: pageTreeQueryKeys.document(id),
        queryFn: async () => {
            const { type, data, updatedAt } = await parseResponse(client.nodes[":id"].document.$get({ param: { id } }));
            const rootBlocks = documentTypes[type]?.rootBlocks;
            return { type, updatedAt, state: rootBlocks ? await documentState(rootBlocks, data, blockContext) : undefined };
        },
        // Loaded once per editor: the editor keeps its own state, and the block states hold objects that must stay as they are, e.g.
        // the editor states of Draft.js
        staleTime: Infinity,
        gcTime: 0,
        structuralSharing: false,
        refetchOnWindowFocus: false,
    });

    if (!node || !document) {
        return <Loading behavior="fillPageHeight" />;
    }

    const rootBlocks = documentTypes[document.type]?.rootBlocks;

    return rootBlocks && document.state ? (
        <DocumentForm
            id={id}
            title={
                <Title>
                    <Typography variant="h4">{node.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {node.path}
                    </Typography>
                </Title>
            }
            rootBlocks={rootBlocks}
            initialState={document.state}
            initialUpdatedAt={document.updatedAt}
        />
    ) : (
        <MainContent>
            <Alert severity="error">
                <FormattedMessage
                    id="dextinity.pageTree.document.unknownType"
                    defaultMessage="The admin has no root blocks for the document type {type}"
                    values={{ type: document.type }}
                />
            </Alert>
        </MainContent>
    );
}

interface DocumentFormProps {
    id: string;
    title: ReactNode;
    rootBlocks: RootBlocks;
    initialState: DocumentState;
    initialUpdatedAt: string | null;
}

function DocumentForm({ id, title, rootBlocks, initialState, initialUpdatedAt }: DocumentFormProps) {
    const intl = useIntl();
    const match = useRouteMatch();
    const snackbarApi = useSnackbarApi();
    const { client, scope, blockPreviewUrl } = usePageTreeApi();
    const blockContext = useBlockContext();
    const previewApi = useBlockPreview();
    const selectedTabKey = useRouteMatch<{ tab: string }>(`${match.path}/:tab`)?.params.tab;
    const [state, setState] = useState(initialState);
    const [savedDocument, setSavedDocument] = useState(() => ({
        output: JSON.stringify(documentOutput(rootBlocks, initialState)),
        updatedAt: initialUpdatedAt,
    }));
    const output = useMemo(() => documentOutput(rootBlocks, state), [rootBlocks, state]);
    const hasChanges = JSON.stringify(output) !== savedDocument.output;

    const updateStateOfRootBlock = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(rootBlocks).map((key): [string, Dispatch<SetStateAction<unknown>>] => [
                    key,
                    (setStateAction) =>
                        setState((previousState) => ({
                            ...previousState,
                            [key]: resolveNewState({ prevState: previousState[key], setStateAction }),
                        })),
                ]),
            ),
        [rootBlocks],
    );

    const showError = (message: ReactNode) =>
        snackbarApi.showSnackbar(
            <Snackbar autoHideDuration={6000}>
                <Alert severity="error">{message}</Alert>
            </Snackbar>,
        );

    const {
        mutateAsync: saveDocument,
        isPending: isSaving,
        isError: hasSaveError,
    } = useMutation({
        mutationFn: () =>
            parseResponse(client.nodes[":id"].document.$put({ param: { id }, json: { data: output, lastUpdatedAt: savedDocument.updatedAt } })),
        onSuccess: ({ updatedAt }) => setSavedDocument({ output: JSON.stringify(output), updatedAt }),
        onError: (error) => showError(getErrorMessage(error)),
    });

    const save = async (): Promise<boolean> => {
        const validity = await Promise.all(Object.entries(rootBlocks).map(([key, { block }]) => block.isValid(state[key])));
        if (validity.includes(false)) {
            showError(<FormattedMessage id="dextinity.pageTree.document.invalid" defaultMessage="Fix the invalid content before saving" />);
            return false;
        }
        try {
            await saveDocument();
            return true;
        } catch {
            return false;
        }
    };

    // Memoized, the tab labels validate again when the function changes
    const isRootBlockValid = useMemo(
        () => Object.fromEntries(Object.entries(rootBlocks).map(([key, { block }]) => [key, () => block.isValid(state[key])])),
        [rootBlocks, state],
    );

    const previewedKey = blockPreviewUrl ? previewedRootBlockKey(rootBlocks, selectedTabKey) : undefined;
    const previewState = useMemo(
        () =>
            previewedKey &&
            rootBlocks[previewedKey].block.createPreviewState(state[previewedKey], {
                ...blockContext,
                // The URL of the root block's tab, the preview selects blocks by their routes below it
                parentUrl: previewedKey === Object.keys(rootBlocks)[0] ? match.url : `${match.url}/${previewedKey}`,
                showVisibleOnly: previewApi.showOnlyVisible,
            }),
        [rootBlocks, state, previewedKey, blockContext, match.url, previewApi.showOnlyVisible],
    );
    const contentScopeJwt = useMemo(() => createUnsecuredScopeJwt(scope), [scope]);

    const rootBlockEditors = Object.entries(rootBlocks).map(([key, { label, block }]) => ({
        key,
        label,
        isValid: isRootBlockValid[key],
        content: (
            <BlockAdminComponentRoot title={label}>
                {createElement(block.AdminComponent, { state: state[key], updateState: updateStateOfRootBlock[key] })}
            </BlockAdminComponentRoot>
        ),
    }));

    return (
        <>
            {hasChanges && (
                <RouterPrompt
                    message={(location) =>
                        // Navigating into the blocks stays in the editor
                        location.pathname.startsWith(match.url) ||
                        intl.formatMessage({ id: "dextinity.pageTree.document.discardChanges", defaultMessage: "Discard unsaved changes?" })
                    }
                    saveAction={save}
                />
            )}
            <StackToolbar>
                <ToolbarBackButton />
                <ToolbarItem>{title}</ToolbarItem>
                <FillSpace />
                <ToolbarActions>
                    <SaveButton onClick={() => save().then(() => undefined)} loading={isSaving} hasErrors={hasSaveError} disabled={!hasChanges} />
                </ToolbarActions>
            </StackToolbar>
            <MainContent disablePaddingBottom>
                {previewedKey ? (
                    <BlockPreviewWithTabs
                        previewUrl={`${blockPreviewUrl}${rootBlocks[previewedKey].previewPath}`}
                        previewState={previewState}
                        previewApi={previewApi}
                        contentScopeJwt={contentScopeJwt}
                    >
                        {rootBlockEditors.map(({ key, label, isValid, content }) => ({
                            key,
                            label: <BlockAdminTabLabel isValid={isValid}>{label}</BlockAdminTabLabel>,
                            content,
                        }))}
                    </BlockPreviewWithTabs>
                ) : rootBlockEditors.length === 1 ? (
                    rootBlockEditors[0].content
                ) : (
                    <RouterTabs>
                        {rootBlockEditors.map(({ key, label, isValid, content }, index) => (
                            <RouterTab
                                key={key}
                                path={index === 0 ? "" : `/${key}`}
                                label={<BlockAdminTabLabel isValid={isValid}>{label}</BlockAdminTabLabel>}
                            >
                                {content}
                            </RouterTab>
                        ))}
                    </RouterTabs>
                )}
            </MainContent>
        </>
    );
}

const Title = styled("div")`
    display: flex;
    flex-direction: column;
`;
