import { gql } from "@apollo/client";
import { messages } from "@dextinity/admin";
import { Image } from "@dextinity/admin-icons";
import { FormattedMessage } from "react-intl";

import type { EntityInterface } from "../entities/types";
import type { GQLDamFileEntityQuery, GQLDamFileEntityQueryVariables } from "./createDamFileEntity.generated";

function createDamFileEntity(basePath = "/assets"): EntityInterface {
    return {
        displayName: <FormattedMessage {...messages.file} />,
        icon: Image,
        resolvePath: async ({ apolloClient, id }) => {
            const { data, error } = await apolloClient.query<GQLDamFileEntityQuery, GQLDamFileEntityQueryVariables>({
                query: gql`
                    query DamFileEntity($id: ID!) {
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

            if (error || !data) {
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

export { createDamFileEntity };

/**
 * @deprecated Use `createDamFileEntity` instead. Will be removed in version 12.
 * @alias
 */
export const createDamFileDependency = createDamFileEntity;
