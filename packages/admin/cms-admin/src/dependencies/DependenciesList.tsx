import type { TypedDocumentNode } from "@apollo/client";
import { useIntl } from "react-intl";

import type { GQLDependency } from "../graphql.generated";
import { DependencyList, type DependencyListQueryVariables } from "./DependencyList";

type Dependency = Pick<
    GQLDependency,
    "targetGraphqlObjectType" | "targetId" | "rootColumnName" | "jsonPath" | "name" | "secondaryInformation" | "visible"
> &
    // Optional so that queries written before the field existed remain valid
    Partial<Pick<GQLDependency, "scope">>;

interface DependenciesListQuery {
    item: {
        id: string;
        dependencies: { totalCount: number; nodes: Array<Dependency> };
    };
}

export interface DependenciesListProps {
    query: TypedDocumentNode<DependenciesListQuery, DependencyListQueryVariables>;
    variables: Record<string, unknown>;
}

export const DependenciesList = ({ query, variables }: DependenciesListProps) => {
    const intl = useIntl();
    return (
        <DependencyList
            query={query}
            variables={variables}
            listKey="dependencies"
            typeFilterField="targetGraphqlObjectType"
            getPage={(data) =>
                data.item.dependencies && {
                    totalCount: data.item.dependencies.totalCount,
                    nodes: data.item.dependencies.nodes.map((node) => ({
                        rowId: `${node.targetId}_${node.rootColumnName}_${node.jsonPath}`,
                        id: node.targetId,
                        graphqlObjectType: node.targetGraphqlObjectType,
                        rootColumnName: node.rootColumnName,
                        jsonPath: node.jsonPath,
                        scope: node.scope ?? undefined,
                        name: node.name,
                        secondaryInformation: node.secondaryInformation,
                        visible: node.visible,
                    })),
                }
            }
            labels={{
                list: intl.formatMessage({ id: "dextinity.dependencies.dependencies.list", defaultMessage: "Dependencies" }),
                emptyTitle: intl.formatMessage({ id: "dextinity.dependencies.dependencies.empty", defaultMessage: "No dependencies" }),
                emptyDescription: intl.formatMessage({
                    id: "dextinity.dependencies.dependencies.emptyDescription",
                    defaultMessage: "This item doesn't link to or embed other pages, files or content.",
                }),
                infoTitle: intl.formatMessage({
                    id: "dextinity.dependencies.dependencies.info.title",
                    defaultMessage: "What are dependencies?",
                }),
                infoDescription: intl.formatMessage({
                    id: "dextinity.dependencies.dependencies.info.content",
                    defaultMessage:
                        "Dependencies are all items that this content references or uses — such as linked pages, embedded files, or other content. Use this list to review what this item depends on.",
                }),
            }}
        />
    );
};
