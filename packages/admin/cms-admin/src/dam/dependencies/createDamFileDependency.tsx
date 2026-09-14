import { gql } from "@apollo/client";
import { messages } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

import type { DependencyInterface } from "../../dependencies/types";
import type { GQLFileDependencyQuery, GQLFileDependencyQueryVariables } from "./createDamFileDependency.generated";

function createDamFileDependency(basePath = "/assets"): DependencyInterface {
    return {
        displayName: <FormattedMessage {...messages.file} />,
        resolvePath: async ({ apolloClient, id }) => {
            const { data, error } = await apolloClient.query<GQLFileDependencyQuery, GQLFileDependencyQueryVariables>({
                query: gql`
                    query FileDependency($id: ID!) {
                        damFile(id: $id) {
                            id
                            folder {
                                id
                                parents {
                                    id
                                }
                            }
                        }
                    }
                `,
                variables: {
                    id,
                },
            });

            if (error) {
                throw new Error(`DamFile.resolvePath: Could not find a DamFile with id ${id}`);
            }

            const folderIds: string[] = [];
            if (data.damFile.folder) {
                data.damFile.folder.parents.forEach((parent) => {
                    folderIds.push(parent.id);
                });
                folderIds.push(data.damFile.folder.id);
            }

            return `${basePath}/${folderIds.map((id) => `${id}/folder`).join("/")}${folderIds.length > 0 ? "/" : ""}${data.damFile.id}/edit`;
        },
    };
}

export { createDamFileDependency };
