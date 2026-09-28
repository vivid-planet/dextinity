import type { GraphQLFetch } from "../graphQLFetch/graphQLFetch";

type BlockMetaField = {
    name: string;
    kind: string;
    nullable: boolean;
    enum?: string[];
    block?: string;
    blocks?: Record<string, string>;
    childBlocks?: Record<string, string>;
    object?: { fields: BlockMetaField[] };
};

interface BlockMeta {
    name: string;
    fields: BlockMetaField[];
    inputFields: BlockMetaField[];
}

// we have two typings for block meta
// 1. for the public api (BlockMeta, BlockMetaField): simpler and compatible with import from block-meta.json (where eg. kind is a string)
// 2. for the internal api (BetterBlockMeta, BetterBlockMetaField): more complex with more type safety
type BetterBlockMetaField =
    | {
          name: string;
          kind: "String" | "Number" | "Boolean" | "Json";
          nullable: boolean;
      }
    | {
          name: string;
          kind: "TipTapRichTextBlock";
          nullable: boolean;
          // The child blocks the rich text content may contain, keyed by their stable config key.
          childBlocks: Record<string, string>;
      }
    | {
          name: string;
          kind: "Enum";
          nullable: boolean;
          enum: string[];
      }
    | {
          name: string;
          kind: "Block";
          nullable: boolean;
          block: string;
      }
    | {
          name: string;
          kind: "OneOfBlocks";
          nullable: boolean;
          blocks: Record<string, string>;
      }
    | {
          name: string;
          kind: "NestedObject" | "NestedObjectList";
          nullable: boolean;
          object: BetterBlockMetaNestedObject;
      };

interface BetterBlockMeta {
    name: string;
    fields: BetterBlockMetaField[];
    inputFields: BetterBlockMetaField[];
}

interface BetterBlockMetaNestedObject {
    fields: BetterBlockMetaField[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockLoader<BlockData = any> = (options: BlockLoaderOptions<BlockData>) => Promise<any> | any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockLoaderOptions<BlockData = any> = { blockData: BlockData } & BlockLoaderDependencies;

export interface BlockLoaderDependencies {
    graphQLFetch: GraphQLFetch;
    fetch: typeof fetch;
}

export async function recursivelyLoadBlockData({
    blockType,
    blockData,
    blocksMeta,
    loaders,
    ...dependencies
}: {
    blockType: string;
    blockData: unknown;
    blocksMeta: BlockMeta[];
    loaders: Record<string, BlockLoader>;
} & BlockLoaderDependencies) {
    // Rich text fields (e.g. TipTapRichText's `tipTapContent`) are marked in the block meta with the child
    // blocks they may contain. Child blocks are embedded as `cmsBlock`/`cmsInlineBlock` nodes carrying their
    // block type and data. Walk the content tree and run each embedded child block through the regular block
    // loading so their loaders run too.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function loadRichTextChildBlocks(node: any, childBlocks: Record<string, string>): any {
        if (!node || typeof node !== "object") {
            return node;
        }

        let result = node;
        const blockType = node.type === "cmsBlock" || node.type === "cmsInlineBlock" ? node.attrs?.blockType : undefined;
        if (blockType && childBlocks[blockType]) {
            result = {
                ...result,
                attrs: {
                    ...result.attrs,
                    data: iterateBlock({ blockType: childBlocks[blockType], blockData: result.attrs.data }),
                },
            };
        }

        if (Array.isArray(result.content)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result = { ...result, content: result.content.map((child: any) => loadRichTextChildBlocks(child, childBlocks)) };
        }

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function iterateField(block: BetterBlockMeta | BetterBlockMetaNestedObject, passedBlockData: any) {
        const blockData = { ...passedBlockData };
        for (const field of block.fields) {
            if (!blockData[field.name]) {
                //null
                continue;
            } else if (field.kind == "NestedObjectList") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                blockData[field.name] = blockData[field.name].map((i: any) => {
                    return iterateField(field.object, i);
                });
            } else if (field.kind == "NestedObject") {
                blockData[field.name] = iterateField(field.object, blockData[field.name]);
            } else if (field.kind == "OneOfBlocks") {
                const oneOfBlockType = field.blocks[blockData.type];
                if (!oneOfBlockType) {
                    throw new Error("invalid blockType");
                }
                blockData[field.name] = iterateBlock({
                    blockType: oneOfBlockType,
                    blockData: blockData[field.name],
                });
            } else if (field.kind == "Block") {
                blockData[field.name] = iterateBlock({
                    blockType: field.block,
                    blockData: blockData[field.name],
                });
            } else if (field.kind == "TipTapRichTextBlock") {
                blockData[field.name] = loadRichTextChildBlocks(blockData[field.name], field.childBlocks);
            }
        }
        return blockData;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadedBlockData: any[] = [];
    function iterateBlock({ blockType, blockData }: { blockType: string; blockData: unknown }) {
        const block = blocksMeta.find((block) => block.name === blockType) as BetterBlockMeta;
        if (!block) {
            throw new Error("invalid blockType");
        }

        const newBlockData = iterateField(block, blockData);
        if (loaders[blockType]) {
            newBlockData.loaded = loaders[blockType]({ blockData, ...dependencies }); // return unresolved promise
            loadedBlockData.push(newBlockData);
        }
        return newBlockData;
    }

    // phase 1: iterate (recursively) over all blocks and call loader (and set loaded to unresolved promise)
    // also populates loadedBlockData with contains all blocks with loaders
    const ret = iterateBlock({ blockType, blockData });

    // phase 2: wait for all loaders to finish
    await Promise.all(loadedBlockData.map((blockData) => blockData.loaded));

    // phase 3: patch loaded with resolved promise
    for (const blockData of loadedBlockData) {
        blockData.loaded = await blockData.loaded;
    }
    return ret;
}
