import { gql } from "@apollo/client";
import { SelectField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { FormattedMessage, useIntl } from "react-intl";

import type { InternalLinkBlockData, InternalLinkBlockInput } from "../blocks.generated";
import type { PageTreeSelectValue } from "../pages/pageTreeSelect/PageTreeSelectDialog";
import { PageTreeSelectField } from "../pages/pageTreeSelect/PageTreeSelectField";
import { usePageTreeNodeDocumentAnchors } from "../pages/usePageTreeDocumentAnchors";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import type { GQLLinkBlockTargetPageQuery, GQLLinkBlockTargetPageQueryVariables } from "./InternalLinkBlock.generated";
import { BlockCategory, type BlockDependency, type BlockInterface, type LinkBlockInterface } from "./types";

type State = InternalLinkBlockData;

export const InternalLinkBlock: BlockInterface<InternalLinkBlockData, State, InternalLinkBlockInput> & LinkBlockInterface<State> = {
    ...createBlockSkeleton(),

    name: "InternalLink",

    displayName: <FormattedMessage id="dextinity.blocks.internalLink" defaultMessage="Page Tree" />,

    defaultValues: () => ({ targetPage: undefined }),

    category: BlockCategory.Navigation,
    iconName: "link",
    description: <FormattedMessage id="dextinity.blocks.internalLink.description" defaultMessage="Link to a page of this site" />,

    input2State: (state) => {
        return state;
    },

    state2Output: (state) => {
        return {
            targetPageId: state.targetPage?.id,
            targetPageAnchor: state.targetPageAnchor,
        };
    },

    output2State: async (output, { apolloClient, pageTreeScope }) => {
        if (output.targetPageId === undefined) {
            return {};
        }

        const { data } = await apolloClient.query<GQLLinkBlockTargetPageQuery, GQLLinkBlockTargetPageQueryVariables>({
            query: gql`
                query LinkBlockTargetPage($id: ID!) {
                    pageTreeNode(id: $id) {
                        id
                        name
                        path
                        documentType
                    }
                }
            `,
            variables: { id: output.targetPageId },
        });

        const targetPage = data.pageTreeNode ? { ...data.pageTreeNode, scope: pageTreeScope } : undefined;

        // TODO consider throwing an error
        return { targetPage, targetPageAnchor: output.targetPageAnchor };
    },

    isValid: () => {
        // TODO internal link validation
        return true;
    },

    dependencies: (state) => {
        const dependencies: BlockDependency[] = [];

        if (state.targetPage?.id) {
            dependencies.push({
                targetGraphqlObjectType: "PageTreeNode",
                id: state.targetPage.id,
            });
        }

        return dependencies;
    },

    replaceDependenciesInOutput: (output, replacements) => {
        const clonedOutput: InternalLinkBlockInput = { ...output };
        const replacement = replacements.find((replacement) => replacement.type === "PageTreeNode" && replacement.originalId === output.targetPageId);

        if (replacement) {
            clonedOutput.targetPageId = replacement.replaceWithId;
        }

        return clonedOutput;
    },

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => {
        const intl = useIntl();
        const anchors = usePageTreeNodeDocumentAnchors(state.targetPage);
        const anchorsLoading = state.targetPage != null && anchors === undefined;
        const noAnchor = "none";

        return (
            <SelectPreviewComponent>
                <BlockAdminComponentPaper>
                    <BlocksFinalForm<{ targetPage: PageTreeSelectValue | null; targetPageAnchor: string | null }>
                        onSubmit={(newState) => {
                            updateState((previousState) => {
                                if (newState.targetPage == null) {
                                    return {
                                        targetPage: undefined,
                                        targetPageAnchor: undefined,
                                    };
                                } else if (newState.targetPage.id !== previousState.targetPage?.id) {
                                    return {
                                        targetPage: newState.targetPage,
                                        targetPageAnchor: undefined,
                                    };
                                } else {
                                    return {
                                        targetPage: newState.targetPage,
                                        targetPageAnchor:
                                            newState.targetPageAnchor == null || newState.targetPageAnchor === noAnchor
                                                ? undefined
                                                : newState.targetPageAnchor,
                                    };
                                }
                            });
                        }}
                        initialValues={{
                            targetPage: (state.targetPage as PageTreeSelectValue | undefined) ?? null,
                            // Unset while the anchors load, as the select can only show an anchor that is one of its options
                            targetPageAnchor: anchorsLoading ? null : (state.targetPageAnchor ?? noAnchor),
                        }}
                    >
                        <Fields>
                            <PageTreeSelectField
                                name="targetPage"
                                label={intl.formatMessage({ id: "dextinity.blocks.internalLink.targetPage.label", defaultMessage: "Page" })}
                            />
                            <SelectField
                                name="targetPageAnchor"
                                label={<FormattedMessage id="dextinity.blocks.internalLink.anchor.label" defaultMessage="Anchor" />}
                                disabled={state.targetPage == null || anchorsLoading}
                                options={[
                                    {
                                        value: noAnchor,
                                        label: intl.formatMessage({ id: "dextinity.blocks.internalLink.anchor.none", defaultMessage: "None" }),
                                    },
                                    ...(anchors ?? []).map((anchor) => ({ value: anchor, label: anchor })),
                                ]}
                            />
                        </Fields>
                    </BlocksFinalForm>
                </BlockAdminComponentPaper>
            </SelectPreviewComponent>
        );
    },

    previewContent: (state) => {
        if (state.targetPage == null) {
            return [];
        }

        return [
            {
                type: "text",
                content: state.targetPageAnchor === undefined ? state.targetPage.name : `${state.targetPage.name}#${state.targetPageAnchor}`,
            },
        ];
    },

    extractTextContents: (state) => {
        return state.targetPage?.name ? [state.targetPage.name] : [];
    },
};

const Fields = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-density-form-gap);
`;
