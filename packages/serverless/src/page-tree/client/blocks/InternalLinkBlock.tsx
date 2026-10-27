import { Field, FinalFormInput } from "@dextinity/admin";
import {
    BlockAdminComponentPaper,
    BlockCategory,
    type BlockInterface,
    BlocksFinalForm,
    createBlockSkeleton,
    SelectPreviewComponent,
} from "@dextinity/cms-admin";
import { Box, Divider } from "@mui/material";
import { parseResponse } from "hono/client";
import { FormattedMessage } from "react-intl";

import { createPageTreeApiClient } from "../PageTreeApiProvider.js";
import { PageTreeSelect, type PageTreeSelectNode } from "./PageTreeSelect.js";

export interface InternalLinkBlockState {
    targetPage?: PageTreeSelectNode;
    targetPageAnchor?: string;
}

export interface InternalLinkBlockOutput {
    targetPageId?: string;
    targetPageAnchor?: string;
}

/**
 * The internal link of `@dextinity/cms-admin` with the page tree's REST API. The anchor is entered, the anchors of the target page
 * aren't offered: that would need the target's document in the admin blocks' state.
 */
export const InternalLinkBlock: BlockInterface<InternalLinkBlockOutput, InternalLinkBlockState, InternalLinkBlockOutput> = {
    ...createBlockSkeleton(),

    name: "InternalLink",

    displayName: <FormattedMessage id="dextinity.blocks.internalLink" defaultMessage="Page Tree" />,

    category: BlockCategory.Navigation,

    defaultValues: () => ({}),

    state2Output: ({ targetPage, targetPageAnchor }) => ({ targetPageId: targetPage?.id, targetPageAnchor }),

    output2State: async ({ targetPageId, targetPageAnchor }, { apiUrl }) => {
        if (!targetPageId) {
            return {};
        }
        const response = await createPageTreeApiClient(apiUrl).nodes[":id"].$get({ param: { id: targetPageId } });
        if (response.status === 404) {
            return {};
        }
        const { id, name, path, documentType } = await parseResponse(response);
        return { targetPage: { id, name, path, documentType }, targetPageAnchor };
    },

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => (
        <SelectPreviewComponent>
            <BlockAdminComponentPaper disablePadding>
                <BlocksFinalForm<InternalLinkBlockState>
                    onSubmit={({ targetPage, targetPageAnchor }) =>
                        // An anchor of another page doesn't fit
                        updateState((previousState) => ({
                            targetPage,
                            targetPageAnchor:
                                targetPage && targetPage.id === previousState.targetPage?.id ? targetPageAnchor || undefined : undefined,
                        }))
                    }
                    initialValues={state}
                >
                    <Field name="targetPage" component={PageTreeSelect} fullWidth />
                    <Divider />
                    <Box padding={3}>
                        <Field
                            name="targetPageAnchor"
                            label={<FormattedMessage id="dextinity.blocks.internalLink.anchor.label" defaultMessage="Anchor" />}
                            component={FinalFormInput}
                            fullWidth
                            disabled={!state.targetPage}
                            disableContentTranslation
                        />
                    </Box>
                </BlocksFinalForm>
            </BlockAdminComponentPaper>
        </SelectPreviewComponent>
    ),

    previewContent: ({ targetPage, targetPageAnchor }) =>
        targetPage ? [{ type: "text", content: targetPageAnchor ? `${targetPage.name}#${targetPageAnchor}` : targetPage.name }] : [],

    extractTextContents: ({ targetPage }) => (targetPage ? [targetPage.name] : []),
};
