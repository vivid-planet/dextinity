import { gql } from "@apollo/client";

import type { BlockInputApi, BlockInterface } from "../blocks/types";
import type { Maybe } from "../graphql.generated";
import type { DependencyInterface } from "./types";

interface Query<RootBlocks extends Record<string, BlockInterface>> {
    node: Maybe<{ id: string } & { [Key in keyof RootBlocks]: BlockInputApi<RootBlocks[Key]> }>;
}

interface QueryVariables {
    id: string;
}

export function createDependencyMethods<RootBlocks extends Record<string, BlockInterface>>({
    rootQueryName,
    rootBlocks,
    basePath,
}: {
    rootQueryName: string;
    rootBlocks: { [Key in keyof RootBlocks]: RootBlocks[Key] | { block: RootBlocks[Key]; path?: string } };
    basePath: string | ((node: NonNullable<Query<RootBlocks>["node"]>) => string);
}): Pick<DependencyInterface, "resolvePath"> {
    return {
        resolvePath: async ({ rootColumnName, jsonPath, apolloClient, id }) => {
            const { data, error } = await apolloClient.query<Query<RootBlocks>, QueryVariables>({
                query: gql`
                    query ${rootQueryName}Dependency($id: ID!) {
                        node: ${rootQueryName}(id: $id) {
                            id
                            ${Object.keys(rootBlocks).join("\n")}
                        }    
                    }    
                `,
                variables: {
                    id,
                },
            });

            if (error || data.node === null) {
                throw new Error(`Error for document ${id}: ${error?.message ?? "Document is undefined"}`);
            }

            let url: string;

            if (typeof basePath === "string") {
                url = basePath;
            } else {
                url = basePath(data.node);
            }

            if (jsonPath && rootColumnName) {
                let block: BlockInterface;
                let path: string | undefined;

                const rootBlock = rootBlocks[rootColumnName];

                if (isBlockInterface(rootBlock)) {
                    block = rootBlock;
                } else {
                    block = rootBlock.block;
                    path = rootBlock.path;
                }

                url += `${path ?? ""}/`;
                url += block.resolveDependencyPath(block.input2State(data.node[rootColumnName]), jsonPath.substring("root.".length));
            }

            return url;
        },
    };
}

function isBlockInterface(block: unknown): block is BlockInterface {
    return typeof block === "object" && block !== null && "name" in block;
}
