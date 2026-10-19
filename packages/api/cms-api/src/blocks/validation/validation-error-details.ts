import type { ValidationError } from "@nestjs/common";

import { type Block, type BlockMetaField, BlockMetaFieldKind, type BlockMetaInterface, getBlockOfBlockInput } from "../block";

export interface ValidationErrorDetail {
    /**
     * Path of the invalid value in the validated input, for instance `content.blocks[3].props.headline`.
     */
    path: string;
    /**
     * Registered name of the innermost block that contains the invalid value. Use it to look up the block's meta.
     */
    blockName?: string;
    /**
     * Value of the `key` field of the innermost entry of a blocks or list block on the path.
     */
    blockKey?: string;
    /**
     * Value of the `type` field of the innermost entry of a blocks or one-of block on the path.
     */
    blockType?: string;
    /**
     * Names the block, the field and the cause, for instance `Field "height" of block Space (key "a1b2"): must be an integer number, but is "large".`
     */
    message: string;
}

interface Entry {
    key?: string;
    type?: string;
}

interface EnclosingBlock {
    block: Block;
    // Only set if an entry holds the block directly in one of its fields, usually "props".
    keyOfBlock?: string;
}

interface TargetContext {
    path: string;
    pathInBlock: string;
    enclosingBlock?: EnclosingBlock;
    meta?: BlockMetaInterface;
    entry?: Entry;
    isEntry?: boolean;
    isList?: boolean;
    listField?: BlockMetaField;
}

interface ErrorAtPath {
    path: string;
    pathInBlock: string;
    property: string;
    enclosingBlock?: EnclosingBlock;
    entry?: Entry;
    field?: BlockMetaField;
    parentMeta?: BlockMetaInterface;
    constraints: Record<string, string>;
    value: unknown;
}

const maxValueLength = 60;

/**
 * Flattens the class-validator errors of an input into one error per invalid value, naming the block, the field and the cause.
 * Blocks are only recognized in inputs created by the `blockInputFactory` of a registered block.
 */
export function getValidationErrorDetails(errors: ValidationError[]): ValidationErrorDetail[] {
    const errorsByPath = new Map<string, ErrorAtPath>();
    const rootContext = createObjectContext({ value: errors[0]?.target, path: "" });

    for (const error of errors) {
        collectErrors({ error, context: rootContext, errorsByPath });
    }

    return Array.from(errorsByPath.values()).map((error) => ({
        path: error.path,
        blockName: error.enclosingBlock?.block.name,
        blockKey: error.entry?.key,
        blockType: error.entry?.type,
        message: formatMessage(error),
    }));
}

function collectErrors({ error, context, errorsByPath }: { error: ValidationError; context: TargetContext; errorsByPath: Map<string, ErrorAtPath> }) {
    const isListItem = context.isList === true;
    const path = isListItem ? appendIndex(context.path, error.property) : joinPath(context.path, error.property);
    const pathInBlock = isListItem ? appendIndex(context.pathInBlock, error.property) : joinPath(context.pathInBlock, error.property);
    const field = isListItem ? context.listField : context.meta?.fields.find((field) => field.name === error.property);

    if (error.constraints && Object.keys(error.constraints).length > 0) {
        const existingError = errorsByPath.get(path);

        errorsByPath.set(
            path,
            existingError
                ? { ...existingError, constraints: { ...existingError.constraints, ...error.constraints } }
                : {
                      path,
                      pathInBlock,
                      property: error.property,
                      enclosingBlock: context.enclosingBlock,
                      entry: context.entry,
                      field,
                      parentMeta: context.meta,
                      constraints: error.constraints,
                      value: error.value,
                  },
        );
    }

    if (!error.children?.length) {
        return;
    }

    const value = error.value ?? error.children[0].target;
    let childContext: TargetContext;

    if (value instanceof Map) {
        // composeBlocks keeps its child blocks in a map, while the input has them as fields of the block.
        childContext = context;
    } else if (Array.isArray(value)) {
        childContext = { path, pathInBlock, enclosingBlock: context.enclosingBlock, entry: context.entry, isList: true, listField: field };
    } else {
        childContext = createObjectContext({ value, path, pathInBlock, field, parentContext: context });
    }

    for (const child of error.children) {
        collectErrors({ error: child, context: childContext, errorsByPath });
    }
}

function createObjectContext({
    value,
    path,
    pathInBlock = path,
    field,
    parentContext,
}: {
    value: unknown;
    path: string;
    pathInBlock?: string;
    field?: BlockMetaField;
    parentContext?: TargetContext;
}): TargetContext {
    const block = getBlockOfBlockInput(value);

    if (block) {
        const keyOfBlock = parentContext?.isEntry ? parentContext.entry?.key : undefined;

        return { path, pathInBlock: "", meta: block.blockInputMeta, enclosingBlock: { block, keyOfBlock }, entry: parentContext?.entry };
    }

    const meta = field?.kind === BlockMetaFieldKind.NestedObject || field?.kind === BlockMetaFieldKind.NestedObjectList ? field.object : undefined;
    const isEntry = meta !== undefined && isEntryMeta(meta);

    return {
        path,
        pathInBlock,
        meta,
        enclosingBlock: parentContext?.enclosingBlock,
        entry: isEntry ? getEntry(value) : parentContext?.entry,
        isEntry,
    };
}

// An entry of a blocks or list block has a "key" field, an entry of a blocks or one-of block has a one-of field.
function isEntryMeta(meta: BlockMetaInterface): boolean {
    return meta.fields.some((field) => field.name === "key" || field.kind === BlockMetaFieldKind.OneOfBlocks);
}

function getEntry(value: unknown): Entry {
    const { key, type } = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;

    return { key: typeof key === "string" ? key : undefined, type: typeof type === "string" ? type : undefined };
}

function formatMessage(error: ErrorAtPath): string {
    const constraints = Object.entries(error.constraints);
    // A list that isn't an array also fails the checks of its items, for instance "nestedValidation" and "isObject".
    const relevantConstraints = "isArray" in error.constraints ? constraints.filter(([constraint]) => constraint === "isArray") : constraints;
    const causes = relevantConstraints.map(([constraint, message]) => describeCause({ error, constraint, message }));

    return `${describeLocation(error)}: ${[...new Set(causes)].join(" ")}`;
}

function describeLocation({ path, pathInBlock, enclosingBlock }: ErrorAtPath): string {
    if (!enclosingBlock) {
        return `Field "${path}"`;
    }

    const keyOfBlock = enclosingBlock.keyOfBlock !== undefined ? ` (key "${enclosingBlock.keyOfBlock}")` : "";

    return `Field "${pathInBlock}" of block ${enclosingBlock.block.name}${keyOfBlock}`;
}

function describeCause({
    error: { property, field, parentMeta, value },
    constraint,
    message,
}: {
    error: ErrorAtPath;
    constraint: string;
    message: string;
}): string {
    switch (constraint) {
        case "whitelistValidation":
            return parentMeta ? `unknown field. Allowed fields: ${parentMeta.fields.map((field) => field.name).join(", ")}.` : "unknown field.";
        case "isDefined":
            return `is missing. Expected ${describeExpectedValue(field)}.`;
        case "isArray":
            return `must be a list, but is ${describeValue(value)}.`;
        case "isObject":
            return Array.isArray(value) ? "each item must be an object." : `must be an object, but is ${describeValue(value)}.`;
        case "isEnum":
        case "isIn": {
            const supportedBlockTypes = property === "type" ? findSupportedBlockTypes(parentMeta) : undefined;

            if (supportedBlockTypes && value !== undefined) {
                return `unknown block type ${describeValue(value)}. Allowed types: ${supportedBlockTypes.join(", ")}.`;
            }

            const allowedValues = field?.kind === BlockMetaFieldKind.Enum ? field.enum.join(", ") : message.split(": ").slice(1).join(": ");
            const problem = value === undefined ? "is missing" : `invalid value ${describeValue(value)}`;

            return `${problem}. Allowed values: ${allowedValues}.`;
        }
        case "arrayMinSize":
            if (isOneOfBlockMeta(parentMeta)) {
                return 'must not be empty. A one-of block lists its variants in "attachedBlocks" as { "type", "props" } and names the active one in "activeType".';
            }

            return `${withoutProperty(message, property)}.`;
        case "nestedValidation":
            if (
                (value === undefined || value === null) &&
                (field?.kind === BlockMetaFieldKind.Block || field?.kind === BlockMetaFieldKind.NestedObject)
            ) {
                return `is missing. Expected ${describeExpectedValue(field)}.`;
            }

            return `must be an object or a list, but is ${describeValue(value)}.`;
        default: {
            // Some validators, for instance IsDraftContent before it had a message, return an empty message.
            const requirement = withoutProperty(message, property) || `must pass the "${constraint}" check`;

            return value === undefined ? `is missing. It ${requirement}.` : `${requirement}, but is ${describeValue(value)}.`;
        }
    }
}

// class-validator starts its messages with the property name, which the location already names.
function withoutProperty(message: string, property: string): string {
    const prefix = `${property} `;

    return message.startsWith(prefix) ? message.slice(prefix.length) : message;
}

function describeValue(value: unknown): string {
    if (value === undefined) {
        return "missing";
    }

    if (Array.isArray(value)) {
        return "a list";
    }

    if (typeof value === "object" && value !== null) {
        return "an object";
    }

    // JSON.stringify throws for a BigInt and returns undefined for a function or a symbol.
    const json = typeof value === "bigint" ? `${value}` : JSON.stringify(value);

    if (json === undefined) {
        return typeof value;
    }

    return json.length > maxValueLength ? `${json.slice(0, maxValueLength)}…` : json;
}

// Describes the fields of a missing block or object one level deep, so that a client can build it without looking it up.
function describeExpectedValue(field: BlockMetaField | undefined): string {
    switch (field?.kind) {
        case BlockMetaFieldKind.Block:
            return withFields(describeFieldType(field), field.block.blockInputMeta);
        case BlockMetaFieldKind.NestedObject:
            return withFields("an object", field.object);
        case BlockMetaFieldKind.NestedObjectList:
            return withFields("a list of objects", field.object);
        default:
            return describeFieldType(field);
    }
}

function withFields(description: string, meta: BlockMetaInterface): string {
    if (meta.fields.length === 0) {
        return description;
    }

    const fields = meta.fields.map((field) => `${field.name} (${describeFieldType(field)}${field.nullable ? " or null" : ""})`);

    return `${description} with the fields ${fields.join(", ")}`;
}

function describeFieldType(field: BlockMetaField | undefined): string {
    switch (field?.kind) {
        case BlockMetaFieldKind.Block:
            return `${/^[AEIOU]/i.test(field.block.name) ? "an" : "a"} ${field.block.name} block`;
        case BlockMetaFieldKind.OneOfBlocks:
            return 'the props of the block named in "type"';
        case BlockMetaFieldKind.NestedObject:
            return "an object";
        case BlockMetaFieldKind.NestedObjectList:
            return "a list";
        case BlockMetaFieldKind.Enum:
            return `one of: ${field.enum.join(", ")}`;
        case BlockMetaFieldKind.String:
            return "a string";
        case BlockMetaFieldKind.Number:
            return "a number";
        case BlockMetaFieldKind.Boolean:
            return "a boolean";
        case BlockMetaFieldKind.Json:
            return "a JSON value";
        case BlockMetaFieldKind.TipTapRichTextBlock:
            return "rich text";
        default:
            return "a value";
    }
}

function findSupportedBlockTypes(meta: BlockMetaInterface | undefined): string[] | undefined {
    const oneOfField = meta?.fields.find((field) => field.kind === BlockMetaFieldKind.OneOfBlocks);

    return oneOfField?.kind === BlockMetaFieldKind.OneOfBlocks ? Object.keys(oneOfField.blocks) : undefined;
}

function isOneOfBlockMeta(meta: BlockMetaInterface | undefined): boolean {
    return ["attachedBlocks", "activeType"].every((name) => meta?.fields.some((field) => field.name === name));
}

function joinPath(path: string, property: string): string {
    return path === "" ? property : `${path}.${property}`;
}

function appendIndex(path: string, index: string): string {
    return `${path}[${index}]`;
}
