import {
    type Block,
    type BlockMetaField as BlockMetaFieldInterface,
    BlockMetaFieldKind,
    type BlockMetaInterface,
    getRegisteredBlocks,
} from "./block";

type BlockMetaField =
    | {
          name: string;
          kind: "String" | "Number" | "Boolean" | "Json";
          nullable: boolean;
          array?: boolean;
      }
    | {
          name: string;
          kind: "RichTextBlock";
          nullable: boolean;
          linkBlock: string;
      }
    | {
          name: string;
          kind: "TipTapRichTextBlock";
          nullable: boolean;
          childBlocks: Record<string, string>;
          linkBlock?: string;
      }
    | {
          name: string;
          kind: "Enum";
          nullable: boolean;
          enum: string[];
          array?: boolean;
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
          object: BlockMetaNestedObject;
      };

interface BlockMeta {
    name: string;
    fields: BlockMetaField[];
    inputFields: BlockMetaField[];
}

interface BlockMetaNestedObject {
    fields: BlockMetaField[];
}

function extractFromBlockMeta(blockMeta: BlockMetaInterface): BlockMetaField[] {
    return blockMeta.fields.map((field) => {
        if (
            field.kind === BlockMetaFieldKind.String ||
            field.kind === BlockMetaFieldKind.Number ||
            field.kind === BlockMetaFieldKind.Boolean ||
            field.kind === BlockMetaFieldKind.Json
        ) {
            //literal
            return {
                name: field.name,
                kind: field.kind,
                nullable: field.nullable,
                array: field.array,
            };
        } else if (field.kind === BlockMetaFieldKind.RichTextBlock) {
            return {
                name: field.name,
                kind: field.kind,
                nullable: field.nullable,
                linkBlock: field.linkBlock.name,
            };
        } else if (field.kind === BlockMetaFieldKind.TipTapRichTextBlock) {
            return {
                name: field.name,
                kind: field.kind,
                nullable: field.nullable,
                childBlocks: Object.fromEntries(Object.entries(field.childBlocks).map(([blockType, block]) => [blockType, block.name])),
                linkBlock: field.linkBlock?.name,
            };
        } else if (field.kind === BlockMetaFieldKind.Enum) {
            return {
                name: field.name,
                kind: field.kind,
                enum: field.enum,
                nullable: field.nullable,
                array: field.array,
            };
        } else if (field.kind === BlockMetaFieldKind.Block) {
            return {
                name: field.name,
                kind: field.kind,
                block: field.block.name,
                nullable: field.nullable,
            };
        } else if (field.kind === BlockMetaFieldKind.NestedObject || field.kind === BlockMetaFieldKind.NestedObjectList) {
            return {
                name: field.name,
                kind: field.kind,
                object: {
                    fields: extractFromBlockMeta(field.object),
                },
                nullable: field.nullable,
            };
        } else if (field.kind === BlockMetaFieldKind.OneOfBlocks) {
            return {
                name: field.name,
                kind: field.kind,
                blocks: Object.fromEntries(Object.entries(field.blocks).map(([key, block]) => [key, block.name])),
                nullable: field.nullable,
            };
        } else {
            throw new Error("Unknown field type");
        }
    });
}

/**
 * Returns the meta of the given blocks and, recursively, of their child blocks. Consumers can therefore resolve every block reference in the meta.
 */
export function getBlocksMeta(rootBlocks: Block[] = getRegisteredBlocks()): BlockMeta[] {
    return getUsedBlocks(rootBlocks)
        .sort((blockA, blockB) => blockA.name.localeCompare(blockB.name))
        .map((block) => {
            const meta: BlockMeta = {
                name: block.name,
                fields: extractFromBlockMeta(block.blockMeta),
                inputFields: extractFromBlockMeta(block.blockInputMeta),
            };
            return meta;
        });
}

function getBlocksOfMetaField(field: BlockMetaFieldInterface): Block[] {
    switch (field.kind) {
        case BlockMetaFieldKind.Block:
            return [field.block];
        case BlockMetaFieldKind.OneOfBlocks:
            return Object.values(field.blocks);
        case BlockMetaFieldKind.RichTextBlock:
            return [field.linkBlock];
        case BlockMetaFieldKind.TipTapRichTextBlock:
            return [...Object.values(field.childBlocks), ...(field.linkBlock ? [field.linkBlock] : [])];
        case BlockMetaFieldKind.NestedObject:
        case BlockMetaFieldKind.NestedObjectList:
            return getBlocksOfMeta(field.object);
        default:
            return [];
    }
}

function getBlocksOfMeta(meta: BlockMetaInterface): Block[] {
    return meta.fields.flatMap((field) => getBlocksOfMetaField(field));
}

/**
 * Returns all blocks that are used by the given root blocks: the root blocks themselves and, recursively, all blocks they reference.
 */
export function getUsedBlocks(rootBlocks: Block[]): Block[] {
    const usedBlocks = new Set<Block>();
    const blocksToVisit = [...rootBlocks];

    while (blocksToVisit.length > 0) {
        const block = blocksToVisit.pop();

        if (!block || usedBlocks.has(block)) {
            continue;
        }
        usedBlocks.add(block);

        blocksToVisit.push(...getBlocksOfMeta(block.blockMeta), ...getBlocksOfMeta(block.blockInputMeta));
    }

    return Array.from(usedBlocks);
}
