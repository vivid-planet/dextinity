import { type Block, type BlockMetaField, BlockMetaFieldKind } from "../block";

// Describes the fields one level deep, so that a client can build the block without looking up its meta.
export function describeBlockInput(block: Block): string {
    const fields = block.blockInputMeta.fields.map((field) => `${field.name} (${describeFieldType(field)}${field.nullable ? " or null" : ""})`);

    return fields.length > 0 ? `${describeBlock(block)} with the fields ${fields.join(", ")}` : describeBlock(block);
}

function describeBlock(block: Block): string {
    return `${/^[AEIOU]/i.test(block.name) ? "an" : "a"} ${block.name} block`;
}

function describeFieldType(field: BlockMetaField): string {
    switch (field.kind) {
        case BlockMetaFieldKind.Block:
            return describeBlock(field.block);
        case BlockMetaFieldKind.OneOfBlocks:
            return 'the props of the block named in "type"';
        case BlockMetaFieldKind.NestedObject:
            return "an object";
        case BlockMetaFieldKind.NestedObjectList:
            return "a list";
        case BlockMetaFieldKind.Enum:
            return field.array ? `a list of: ${field.enum.join(", ")}` : `one of: ${field.enum.join(", ")}`;
        case BlockMetaFieldKind.String:
            return field.array ? "a list of strings" : "a string";
        case BlockMetaFieldKind.Number:
            return field.array ? "a list of numbers" : "a number";
        case BlockMetaFieldKind.Boolean:
            return field.array ? "a list of booleans" : "a boolean";
        case BlockMetaFieldKind.Json:
            return field.array ? "a list of JSON values" : "a JSON value";
        case BlockMetaFieldKind.TipTapRichTextBlock:
            return "rich text";
    }
}
