import type { BlockContext } from "../blocks/context/BlockContext";
import type { BlocksBlockState } from "../blocks/factories/createBlocksBlock";
import type { BlockInterface } from "../blocks/types";
import { collectBlockKeys } from "./blockStateSummary";

export type BlocksBlockChild = BlocksBlockState["blocks"][number];

const describeBlocks = (blocks: readonly BlocksBlockChild[]): string => {
    return blocks.length > 0 ? blocks.map((block) => `"${block.key}" (${block.type})`).join(", ") : "none, the page has no content blocks yet";
};

/** `action` is named for the error messages only — resolving a key is the same question either way. */
export function findBlockByKey({
    blocks,
    key,
    action,
}: {
    blocks: readonly BlocksBlockChild[];
    key: string;
    action: "updated" | "removed" | "moved" | "shown" | "hidden";
}): { child: BlocksBlockChild; index: number } {
    const index = blocks.findIndex((block) => block.key === key);
    if (index >= 0) {
        return { child: blocks[index], index };
    }

    // The block state summary reports the keys of nested blocks as well, so the agent can plausibly
    // address one. Say why it cannot be acted on rather than claiming the key does not exist.
    if (blocks.some((block) => collectBlockKeys(block.props).includes(key))) {
        throw new Error(`The block "${key}" is nested inside another block, and only the page's top-level content blocks can be ${action}.`);
    }

    throw new Error(`No block with the key "${key}" is in the page's content. Blocks that can be ${action}: ${describeBlocks(blocks)}.`);
}

export const describeType = (value: unknown): string => {
    if (value === null) {
        return "null";
    }
    return Array.isArray(value) ? "an array" : typeof value;
};

/** The agent's "props" argument, which the schema describes as an object but does not enforce as one. */
export function asBlockProps(props: unknown): Record<string, unknown> {
    if (props === null || typeof props !== "object" || Array.isArray(props)) {
        throw new Error(`"props" must be an object holding the block's fields, but was ${describeType(props)}.`);
    }
    return props as Record<string, unknown>;
}

// Block states can embed React elements and class instances, so a merge must not walk into anything
// but the plain data the saved shape is made of.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

/**
 * Merges the fields the agent supplied into the block's current saved shape, so it can change one
 * field without restating the whole block. Nested objects merge the same way; everything else —
 * arrays included — replaces what is there, which is also the only way to shorten a list.
 */
export function mergeBlockProps(current: unknown, patch: Record<string, unknown>): Record<string, unknown> {
    const merged: Record<string, unknown> = isPlainObject(current) ? { ...current } : {};

    for (const [fieldName, value] of Object.entries(patch)) {
        const currentValue = merged[fieldName];
        merged[fieldName] = isPlainObject(value) && isPlainObject(currentValue) ? mergeBlockProps(currentValue, value) : value;
    }
    return merged;
}

const listFields = (fields: readonly string[]): string => fields.map((field) => `"${field}"`).join(", ");

/**
 * A block converts the fields it declares and ignores the rest, so a field it does not have is
 * dropped on the way in rather than refused: the block keeps the content it had, and nothing says
 * so. That is what props built from the wrong block's schema look like from here, and the wrong
 * schema is easy to reach — "RichText" and "StandaloneRichText" are both real blocks, and only the
 * latter is what a "richtext" block on the page is, so the name that suggests itself returns a real
 * schema instead of an error. Converting back is what makes the difference visible.
 *
 * Only the block's own fields are checked: the blocks nested inside it are not resolved here, so a
 * field that is wrong further down still passes.
 */
function findUnknownFields({
    block,
    state,
    givenFields,
}: {
    block: BlockInterface;
    state: unknown;
    givenFields: readonly string[];
}): { unknown: string[]; fields: string[] } | null {
    let output: unknown;
    try {
        output = block.state2Output(state);
    } catch {
        // The check is not worth failing a conversion that itself succeeded.
        return null;
    }

    if (!isPlainObject(output)) {
        return null;
    }

    const fields = Object.keys(output);
    return { unknown: givenFields.filter((field) => !fields.includes(field)), fields };
}

/**
 * Converts a block's saved shape into editor state.
 *
 * `output2State` also resolves references, e.g. fetching the DAM file behind a `damFileId`. The
 * conversion is the only structural check coming from the block definitions themselves, and it is a
 * weak one: the default implementation passes its input through unchanged, so field-level
 * correctness is not checked here and the API's validators remain the authority when the page is
 * saved. `isValid` is likewise too weak to refuse on, so it is reported as a warning.
 */
/**
 * A one-of block's `output2State` takes `activeType` as it is, so switching the type without an attachment of that type,
 * e.g. a link from internal to external, converts without an error and only fails once the admin renders the block.
 */
function findActiveTypeWithoutAttachment(state: unknown): { activeType: string; attachedTypes: string[] } | undefined {
    if (Array.isArray(state)) {
        for (const item of state) {
            const found = findActiveTypeWithoutAttachment(item);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    if (!isPlainObject(state)) {
        return undefined;
    }

    const { activeType, attachedBlocks } = state;
    if (typeof activeType === "string" && Array.isArray(attachedBlocks)) {
        const attachedTypes = attachedBlocks.map((attachedBlock) => (isPlainObject(attachedBlock) ? String(attachedBlock.type) : ""));
        if (!attachedTypes.includes(activeType)) {
            return { activeType, attachedTypes };
        }
    }

    for (const value of Object.values(state)) {
        const found = findActiveTypeWithoutAttachment(value);
        if (found) {
            return found;
        }
    }
    return undefined;
}

export async function toBlockState({
    block,
    type,
    schemaRootBlockName,
    props,
    givenFields,
    blockContext,
    schemaLookup = `call get_block_schema for "${schemaRootBlockName}" and follow its inputFields -> blocks -> props mapping for "${type}" to get the block name — a name that exists is not proof that it is the right one — then call get_block_schema for that name`,
}: {
    block: BlockInterface;
    type: string;
    /**
     * The name the block holding `type` has in block-meta, which is what get_block_schema resolves.
     * Stated by the caller rather than read off the Admin block, whose own `name` is not reliably
     * the block-meta one (StandaloneMediaBlock, for instance, is called "Media" in the Admin but
     * "StandaloneMedia" in block-meta).
     */
    schemaRootBlockName: string;
    props: Record<string, unknown>;
    /** The fields the agent supplied, which an update merges into more than it passes on. */
    givenFields: readonly string[];
    blockContext: BlockContext;
    /** How the agent finds the block's fields, for the errors. By default, through the mapping of the blocks block. */
    schemaLookup?: string;
}): Promise<{ state: unknown; warnings: string[] }> {
    let state: unknown;
    try {
        state = await block.output2State(props, blockContext);
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`The given props are not valid for the "${type}" block: ${reason}. To get its fields, ${schemaLookup}.`);
    }

    const unknownFields = findUnknownFields({ block, state, givenFields });
    if (unknownFields && unknownFields.unknown.length > 0) {
        throw new Error(
            `The "${type}" block has no ${unknownFields.unknown.length === 1 ? "field" : "fields"} ${listFields(unknownFields.unknown)}, so what was passed for ${unknownFields.unknown.length === 1 ? "it" : "them"} would be dropped and the block would keep the content it has. Its fields are ${listFields(unknownFields.fields)}. ` +
                `Props built from another block's schema look like this: ${schemaLookup}.`,
        );
    }

    const detached = findActiveTypeWithoutAttachment(state);
    if (detached) {
        throw new Error(
            `The "${type}" block's "activeType" is "${detached.activeType}", but its "attachedBlocks" ${detached.attachedTypes.length > 0 ? `only hold ${listFields(detached.attachedTypes)}` : "are empty"}. ` +
                `To switch the type, also pass "attachedBlocks" with an entry of the type "${detached.activeType}" and its props: ${schemaLookup}.`,
        );
    }

    const warnings: string[] = [];
    if (!(await block.isValid(state))) {
        warnings.push(`The "${type}" block considers its content invalid, so the page cannot be saved until it is corrected.`);
    }

    return { state, warnings };
}
