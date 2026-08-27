import { gql, useQuery } from "@apollo/client";
import { Link } from "@dextinity/admin-icons";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { BlockAdminComponentButton } from "../../blocks/common/BlockAdminComponentButton";
import { BlockAdminComponentNestedButton } from "../../blocks/common/BlockAdminComponentNestedButton";
import { usePageTreeConfig } from "../pageTreeConfig";
import type { GQLPageTreeSelectDetailQuery, GQLPageTreeSelectDetailQueryVariables } from "./PageTreeSelect.generated";
import PageTreeSelectDialog, { type GQLSelectedPageFragment } from "./PageTreeSelectDialog";

interface PageTreeSelectProps {
    value: GQLSelectedPageFragment | undefined | null;
    onChange: (newValue: GQLSelectedPageFragment | null) => void;
}

const pageTreeSelectDetail = gql`
    query PageTreeSelectDetail($id: ID!) {
        page: pageTreeNode(id: $id) {
            category
        }
    }
`;

export function PageTreeSelect({ value, onChange }: PageTreeSelectProps) {
    const config = usePageTreeConfig();
    const [open, setOpen] = useState(false);

    const { data, loading } = useQuery<GQLPageTreeSelectDetailQuery, GQLPageTreeSelectDetailQueryVariables>(pageTreeSelectDetail, {
        variables: { id: value?.id as string },
        skip: !value?.id,
    });

    const handleButtonClick = () => setOpen(true);

    let defaultCategory: string;

    if (data?.page?.category) {
        defaultCategory = data.page.category;
    } else {
        if (config.categories.length === 0) {
            throw new Error("No categories defined in the page tree configuration. Please define at least one category.");
        }

        defaultCategory = config.categories[0].category;
    }

    return (
        <>
            {value ? (
                <BlockAdminComponentNestedButton onClick={handleButtonClick} displayName={value.name} preview={value.path} />
            ) : (
                <BlockAdminComponentButton onClick={handleButtonClick} size="large" startIcon={<Link />} disabled={loading}>
                    <FormattedMessage id="dextinity.pages.pageTreeSelect.label" defaultMessage="Select Page" />
                </BlockAdminComponentButton>
            )}

            {/* Render Dialog only when open is true to prevent render-cycles originating from setQuery in usePageQuery */}
            {open && (
                <PageTreeSelectDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    value={value}
                    onChange={onChange}
                    defaultCategory={defaultCategory}
                />
            )}
        </>
    );
}
