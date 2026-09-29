import { gql, useMutation } from "@apollo/client";
import { RowActionsItem, RowActionsMenu } from "@dextinity/admin";
import { MovePage } from "@dextinity/admin-icons";
import { FormattedMessage } from "react-intl";

import type { DocumentInterface, DocumentType } from "../../documents/types";
import { usePageTreeScope } from "../config/usePageTreeScope";
import { usePageTreeConfig } from "../pageTreeConfig";
import type { GQLUpdatePageTreeNodeCategoryMutation, GQLUpdatePageTreeNodeCategoryMutationVariables } from "./MovePageMenuItem.generated";
import type { PageTreePage } from "./usePageTree";
import { usePageTreeContext } from "./usePageTreeContext";

interface Props {
    page: PageTreePage;
}

export function MovePageMenuItem({ page }: Props) {
    const [updatePageTreeNodeCategory, { loading: submitting }] = useMutation<
        GQLUpdatePageTreeNodeCategoryMutation,
        GQLUpdatePageTreeNodeCategoryMutationVariables
    >(gql`
        mutation UpdatePageTreeNodeCategory($id: ID!, $category: String!) {
            updatePageTreeNodeCategory(id: $id, category: $category) {
                id
                category
            }
        }
    `);
    const scope = usePageTreeScope();
    const { categories } = usePageTreeConfig();
    const { query, getDocumentTypesByCategory } = usePageTreeContext();

    if (categories.length <= 1) {
        return null;
    }

    const handleSubMenuItemClick = async (category: string) => {
        if (!categorySupportsDocumentType(category, page.documentType, getDocumentTypesByCategory)) {
            throw new Error(`Cannot move: Target category doesn't support documentType ${page.documentType}`);
        }

        const refetchQueries = [
            { query, variables: { contentScope: scope, category } },
            { query, variables: { contentScope: scope, category: page.category } },
        ];

        await updatePageTreeNodeCategory({
            variables: { id: page.id, category },
            refetchQueries,
        });
    };

    return (
        <RowActionsMenu icon={<MovePage />} text={<FormattedMessage id="dextinity.pages.pages.page.movePage" defaultMessage="Move page" />}>
            {categories.map(({ category, label }) => {
                const canMoveToTargetCategory = categorySupportsDocumentType(category, page.documentType, getDocumentTypesByCategory);

                return (
                    <RowActionsItem
                        key={category}
                        disabled={category === page.category || !canMoveToTargetCategory || submitting}
                        onClick={() => handleSubMenuItemClick(category)}
                    >
                        {label}
                    </RowActionsItem>
                );
            })}
        </RowActionsMenu>
    );
}

const categorySupportsDocumentType = (
    category: string,
    documentType: string,
    getDocumentTypesByCategory?: (category: string) => Record<DocumentType, DocumentInterface>,
) => {
    if (getDocumentTypesByCategory === undefined) {
        // fallback if no category->documentTypes mapping function was passed
        return true;
    }

    const supportedDocumentTypes = Object.keys(getDocumentTypesByCategory(category));
    return supportedDocumentTypes.includes(documentType);
};
