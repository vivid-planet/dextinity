import { useCurrentRouteMatch } from "@dextinity/admin";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { matchPath, useLocation } from "react-router";

import { useBlocksConfig } from "../blocks/config/BlocksConfigContext";
import { useBlockContext } from "../blocks/context/useBlockContext";
import type { BlockInterface } from "../blocks/types";
import { useContentScope } from "../contentScope/Provider";
import { useAiModeToolset } from "./AiModeToolsets";
import type { AdditionalItemFields } from "./blockChildren";
import type { BlocksBlockChild } from "./blockProps";
import { summarizeBlockStateForAiMode } from "./blockStateSummary";
import { type AiModePageTreeDocumentState, createPageTreeDocumentTools } from "./pageTreeDocumentTools";

type RootBlocks = Record<string, BlockInterface>;

type PageTreeDocumentPageState = {
    path?: string;
    document?: ({ __typename: string; id: string } & Record<string, unknown>) | null;
};

type BlocksBlockState = { blocks: BlocksBlockChild[] };

/**
 * Creates a hook that lets the AI Mode read the document of a page tree node open in its editor, and edit the blocks of
 * one of its root blocks, e.g. the content of a page. Pass the same `rootBlocks` as to `createUsePage`, and call the hook
 * in the editor with what `usePage` returns.
 *
 * @experimental
 */
export function createUseAiModePageTreeDocumentToolset<TRootBlocks extends RootBlocks>({
    rootBlocks,
    summarizeRootBlocks = {},
    editableBlocks,
    defaultTab,
}: {
    rootBlocks: TRootBlocks;
    /**
     * Summarizes a root block for the agent where `summarizeBlockStateForAiMode` misses something, e.g.
     * `{ seo: summarizeSeoBlockStateForAiMode }` for the SEO settings.
     */
    summarizeRootBlocks?: Partial<Record<keyof TRootBlocks, (block: BlockInterface, state: unknown) => unknown>>;
    /** The root block whose top-level blocks the agent edits. Leave it out for a document the agent only reads. */
    editableBlocks?: {
        /** The key of a blocks block in `rootBlocks`, e.g. "content". */
        rootBlockKey: keyof TRootBlocks & string;
        /** The `supportedBlocks` of the blocks block. */
        supportedBlocks: Record<string, BlockInterface>;
        /** The `additionalItemFields` of the blocks block, whose default values an inserted block starts with. */
        additionalItemFields?: AdditionalItemFields;
        /** The block's name in block-meta, where the agent looks up the block schemas, e.g. "PageContent" for `PageContentBlock`. */
        schemaBlockName: string;
        /**
         * Block types whose name in block-meta differs from their type, for the agent's schema lookup, e.g. "'image' is the
         * 'DamImage' block".
         */
        schemaNameExamples?: string;
        /** What the agent can't change. By default, that only the top-level blocks of the root block can be edited. */
        restrictions?: string;
    };
    /** The tab that is open when the URL names none, for an editor with tabs, e.g. "content". Leave it out for an editor without tabs. */
    defaultTab?: string;
}) {
    return function useAiModePageTreeDocumentToolset<PageState extends PageTreeDocumentPageState>({
        pageTreeNodeId,
        pageState,
        setPageState,
        hasChanges = false,
    }: {
        pageTreeNodeId: string;
        pageState?: PageState;
        setPageState: Dispatch<SetStateAction<PageState | undefined>>;
        hasChanges?: boolean;
    }) {
        const routeUrl = useCurrentRouteMatch()?.url ?? "";
        const { pathname } = useLocation();
        const blockContext = useBlockContext();
        const { isBlockSupported } = useBlocksConfig();
        const { scope } = useContentScope();

        const document = pageState?.document;

        // Read by the block editing tool after planning, when the render's document may be outdated.
        const latestDocumentRef = useRef(document);
        useEffect(() => {
            latestDocumentRef.current = document;
        });

        const tabRouteMatch = defaultTab !== undefined ? matchPath({ path: `${routeUrl}/:tab`, end: false }, pathname) : null;
        // Nested block editing is URL-driven, so the route below the active tab identifies the selected block.
        const routeOfActiveTab = tabRouteMatch?.pathname ?? routeUrl;

        const state: AiModePageTreeDocumentState | null = document
            ? {
                  pageTreeNodeId,
                  documentType: document.__typename,
                  documentId: document.id,
                  path: pageState?.path,
                  activeTab: defaultTab !== undefined ? (tabRouteMatch?.params.tab ?? defaultTab) : undefined,
                  selectedBlockRoute: pathname.length > routeOfActiveTab.length ? pathname.slice(routeOfActiveTab.length) : undefined,
                  hasChanges,
              }
            : null;

        useAiModeToolset(
            state && document
                ? {
                      id: "page",
                      description:
                          "The editor of the page open in the page tree. It has the page's unsaved changes, which the MCP server's get_page doesn't.",
                      context: state,
                      tools: createPageTreeDocumentTools({
                          state,
                          getDocumentSummary: () =>
                              Object.fromEntries(
                                  Object.entries(rootBlocks).map(([key, block]) => [
                                      key,
                                      (summarizeRootBlocks[key] ?? summarizeBlockStateForAiMode)(block, document[key]),
                                  ]),
                              ),
                          editableBlocks: editableBlocks && {
                              ...editableBlocks,
                              insertableBlocks: isBlockSupported
                                  ? Object.fromEntries(
                                        Object.entries(editableBlocks.supportedBlocks).filter(([, block]) => isBlockSupported(block, scope)),
                                    )
                                  : undefined,
                              blockContext,
                              getBlocks: () =>
                                  (latestDocumentRef.current?.[editableBlocks.rootBlockKey] as BlocksBlockState | undefined)?.blocks ?? [],
                              updateBlocks: (update) => {
                                  setPageState((previous) => {
                                      if (!previous?.document) {
                                          return previous;
                                      }
                                      const { rootBlockKey } = editableBlocks;
                                      const blocksBlockState = previous.document[rootBlockKey] as BlocksBlockState;

                                      return {
                                          ...previous,
                                          document: {
                                              ...previous.document,
                                              [rootBlockKey]: { ...blocksBlockState, blocks: update(blocksBlockState.blocks) },
                                          },
                                      };
                                  });
                              },
                          },
                      }),
                  }
                : null,
        );
    };
}
