import type { TypedDocumentNode } from "@apollo/client";
import { useIntl } from "react-intl";

import type { GQLDependency } from "../graphql.generated";
import { DependencyList, type DependencyListQueryVariables } from "./DependencyList";

type Dependent = Pick<
    GQLDependency,
    "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath" | "name" | "secondaryInformation" | "visible"
> &
    // Optional so that queries written before the field existed remain valid
    Partial<Pick<GQLDependency, "scope">>;

interface DependentsListQuery {
    item: {
        id: string;
        dependents: { totalCount: number; nodes: Array<Dependent> };
    };
}

export interface DependentsListProps {
    query: TypedDocumentNode<DependentsListQuery, DependencyListQueryVariables>;
    variables: Record<string, unknown>;
}

export const DependentsList = ({ query, variables }: DependentsListProps) => {
    const intl = useIntl();
    return (
        <DependencyList
            query={query}
            variables={variables}
            listKey="dependents"
            typeFilterField="rootGraphqlObjectType"
            getPage={(data) =>
                data.item.dependents && {
                    totalCount: data.item.dependents.totalCount,
                    nodes: data.item.dependents.nodes.map((node) => ({
                        rowId: `${node.rootId}_${node.rootColumnName}_${node.jsonPath}`,
                        id: node.rootId,
                        graphqlObjectType: node.rootGraphqlObjectType,
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
                list: intl.formatMessage({ id: "dextinity.dependencies.dependents.list", defaultMessage: "Dependents" }),
                emptyTitle: intl.formatMessage({ id: "dextinity.dependencies.dependents.empty", defaultMessage: "Not used anywhere" }),
                emptyDescription: intl.formatMessage({
                    id: "dextinity.dependencies.dependents.emptyDescription",
                    defaultMessage: "No pages, snippets or other content reference this item.",
                }),
                infoTitle: intl.formatMessage({ id: "dextinity.dependencies.dependents.info.title", defaultMessage: "What are dependents?" }),
                infoDescription: intl.formatMessage({
                    id: "dextinity.dependencies.dependents.info.content",
                    defaultMessage:
                        "Dependents are all content items that reference or use this item — such as pages, snippets, or other content. Use this list to see where this item is used.",
                }),
            }}
        />
    );
};
