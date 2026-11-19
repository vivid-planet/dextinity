import { type BlockContext, type BlockInterface, DamImageBlock } from "@dextinity/cms-admin";
import { createForm } from "final-form";
import { describe, expect, it, vi } from "vitest";

import type { AiModeTool } from "./AiModeScopes";
import type { BlocksBlockChild } from "./blockProps";
import { type AiModeFormField, createFormTools } from "./formTools";

const fields: AiModeFormField[] = [
    { name: "title", label: "Title", type: "text" },
    { name: "date", label: "Date", type: "date" },
    {
        name: "category",
        label: "Category",
        type: "select",
        options: [
            { value: "events", label: "Events" },
            { value: "awards", label: "Awards" },
        ],
    },
    { name: "image", label: "Image", type: "block", block: DamImageBlock },
];

function createTools({
    initialValues = { title: "Hello", date: "2026-01-31", category: "events", image: DamImageBlock.defaultValues() },
}: { initialValues?: Record<string, unknown> } = {}) {
    const form = createForm<Record<string, unknown>>({
        onSubmit: vi.fn(),
        initialValues,
        validate: (values) => (values.title ? {} : { title: "Required" }),
    });
    // A field is part of the form state only while it is registered, as it is while the form renders it.
    for (const { name } of fields) {
        form.registerField(name, () => undefined, { value: true, dirty: true });
    }
    const tools = createFormTools({ entityName: "news", entityLabel: "news article", fields, form, blockContext: {} as BlockContext });
    const call = (name: string, args: Record<string, unknown>) => findTool(tools, name).handler(args, { clearTextSelection: vi.fn() });
    return { form, tools, call };
}

function findTool(tools: AiModeTool[], name: string) {
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No tool "${name}"`);
    }
    return tool;
}

it("names the tools after the entity", () => {
    expect(createTools().tools.map(({ name }) => name)).toEqual(["get_news_form_state", "set_news_form_values"]);
});

describe("get_<entity>_form_state", () => {
    it("returns the values, the changed fields, and the invalid ones", () => {
        const { form, call } = createTools();
        form.change("title", "");

        expect(call("get_news_form_state", {})).toEqual({
            values: { title: "", date: "2026-01-31", category: "events", image: expect.any(Object) },
            changedFields: ["title"],
            invalidFields: ["title"],
        });
    });
});

describe("set_<entity>_form_values", () => {
    it("describes each field in the schema, with the options of a select", () => {
        const { tools } = createTools();

        expect(findTool(tools, "set_news_form_values").inputSchema).toMatchObject({
            properties: {
                values: {
                    properties: {
                        title: { type: "string" },
                        date: { type: "string" },
                        category: { type: "string", enum: ["events", "awards"] },
                    },
                },
            },
        });
    });

    it("sets the values as unsaved changes", () => {
        const { form, call } = createTools();

        expect(call("set_news_form_values", { values: { title: "Award won", category: "awards" } })).toContain("The changes are unsaved");
        expect(form.getState().values).toMatchObject({ title: "Award won", category: "awards" });
        expect(form.getState().dirty).toBe(true);
    });

    it.each([
        [{ subtitle: "x" }, '"subtitle" is no field this tool can set'],
        [{ date: "31.01.2026" }, '"date" must be a date in the format YYYY-MM-DD'],
        [{ category: "sports" }, '"category" must be one of: events, awards'],
        [{ title: 42 }, '"title" must be a string'],
        [{ image: {} }, '"image" is no field this tool can set'],
    ])("refuses %o and changes no field", (values, message) => {
        const { form, call } = createTools();

        expect(() => call("set_news_form_values", { values: { title: "Changed", ...values } })).toThrow(message);
        expect(form.getState().values.title).toBe("Hello");
    });
});

describe("edit_<entity>_form_blocks", () => {
    // Converts like a block that declares the field "text". `onConvert` runs while the conversion is awaited.
    const createTextBlock = (onConvert: () => void = () => undefined) =>
        ({
            defaultValues: () => ({ text: "" }),
            output2State: async (output: Record<string, unknown>) => {
                onConvert();
                return { text: output.text };
            },
            state2Output: (state: unknown) => state,
            isValid: async () => true,
        }) as unknown as BlockInterface;

    const contentBlock = { extractTextContents: () => [] } as unknown as BlockInterface;

    const child = (key: string): BlocksBlockChild => ({ key, type: "text", visible: true, selected: false, slideIn: false, props: { text: key } });

    function createBlocksTools({
        textBlock = createTextBlock(),
        isBlockInsertable,
    }: { textBlock?: BlockInterface; isBlockInsertable?: (block: BlockInterface) => boolean } = {}) {
        const form = createForm<Record<string, unknown>>({
            onSubmit: vi.fn(),
            initialValues: { title: "Hello", content: { blocks: [child("a"), child("b")] } },
        });
        form.registerField("title", () => undefined, { value: true });
        form.registerField("content", () => undefined, { value: true, dirty: true });
        const tools = createFormTools({
            entityName: "news",
            entityLabel: "news article",
            fields: [
                { name: "title", label: "Title", type: "text" },
                {
                    name: "content",
                    label: "Content",
                    type: "blocks",
                    block: contentBlock,
                    supportedBlocks: { text: textBlock },
                    schemaBlockName: "NewsContent",
                },
            ],
            form,
            blockContext: {} as BlockContext,
            isBlockInsertable,
        });
        const clearTextSelection = vi.fn();
        const call = (args: Record<string, unknown>) => findTool(tools, "edit_news_form_blocks").handler(args, { clearTextSelection });
        const getKeys = () => (form.getState().values.content as { blocks: BlocksBlockChild[] }).blocks.map(({ key }) => key);
        return { form, tools, call, getKeys, clearTextSelection };
    }

    it("is offered only by a form with a blocks field, and names the block to start the schema lookup at", () => {
        expect(createTools().tools.map(({ name }) => name)).not.toContain("edit_news_form_blocks");

        const { description } = findTool(createBlocksTools().tools, "edit_news_form_blocks");
        expect(description).toContain("The field 'content' is the 'NewsContent' block.");
    });

    it("changes the blocks of the field as unsaved changes, and forgets the selected text", async () => {
        const { form, call, getKeys, clearTextSelection } = createBlocksTools();

        const result = await call({
            field: "content",
            operations: [
                { operation: "remove", key: "a" },
                { operation: "insert", type: "text", props: { text: "New" } },
            ],
        });

        expect(result).toMatchObject({ message: expect.stringMatching(/^Applied 2 changes to the field 'content' of the news article/) });
        expect(getKeys()).toHaveLength(2);
        expect(getKeys()[0]).toBe("b");
        expect(form.getState().dirty).toBe(true);
        expect(clearTextSelection).toHaveBeenCalledTimes(1);
    });

    it("refuses a field that isn't a blocks field", async () => {
        const { call } = createBlocksTools();

        await expect(async () => call({ field: "title", operations: [{ operation: "remove", key: "a" }] })).rejects.toThrow(
            '"title" is no block field this tool can change. It can change: content.',
        );
    });

    it("doesn't insert a block the content scope doesn't offer", async () => {
        const { call, getKeys } = createBlocksTools({ isBlockInsertable: () => false });

        await expect(async () =>
            call({ field: "content", operations: [{ operation: "insert", type: "text", props: { text: "New" } }] }),
        ).rejects.toThrow();
        expect(getKeys()).toEqual(["a", "b"]);
    });

    it("rejects the batch when the field changed while it was prepared, rather than undoing that change", async () => {
        const formHolder: { form?: ReturnType<typeof createBlocksTools>["form"] } = {};
        const tools = createBlocksTools({ textBlock: createTextBlock(() => formHolder.form?.change("content", { blocks: [child("c")] })) });
        formHolder.form = tools.form;

        await expect(async () =>
            tools.call({ field: "content", operations: [{ operation: "insert", type: "text", props: { text: "New" } }] }),
        ).rejects.toThrow("The field 'content' changed while the edits were prepared");
        expect(tools.getKeys()).toEqual(["c"]);
    });
});
