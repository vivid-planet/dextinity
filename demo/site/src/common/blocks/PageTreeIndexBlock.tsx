import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { PageTreeIndexBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { createSitePath } from "@src/util/createSitePath";
import NextLink from "next/link";
import type { JSX } from "react";

import type { LoadedData, PageTreeNode } from "./PageTreeIndexBlock.loader";
import styles from "./PageTreeIndexBlock.module.scss";

type PageTreeNodeWithChildren = PageTreeNode & { children: PageTreeNodeWithChildren[] };

function buildTree(nodes: PageTreeNode[], parentId = "root"): PageTreeNodeWithChildren[] {
    return nodes
        .filter((node) => (node.parentId || "root") === parentId)
        .map((node) => ({
            ...node,
            children: buildTree(nodes, node.id),
        }));
}

function renderTree(nodes: PageTreeNodeWithChildren[]): JSX.Element {
    return (
        <ul className={styles.list}>
            {nodes.map((node) => (
                <li key={node.id} className={styles.listItem}>
                    <NextLink href={createSitePath({ path: node.path, scope: node.scope })} className={styles.link}>
                        {node.name}
                    </NextLink>
                    {node.children.length > 0 && renderTree(node.children)}
                </li>
            ))}
        </ul>
    );
}

export const PageTreeIndexBlock = withPreview(
    ({ data: { loaded: allNodes } }: PropsWithData<PageTreeIndexBlockData & { loaded: LoadedData }>) => {
        if (allNodes.length === 0) {
            return null;
        }

        const tree = buildTree(allNodes);
        return (
            <PageLayout grid>
                <div className={styles.root}>{renderTree(tree)}</div>
            </PageLayout>
        );
    },
    { label: "Page Tree Index" },
);
