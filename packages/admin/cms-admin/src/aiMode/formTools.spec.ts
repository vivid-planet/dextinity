import { createForm, type FormApi } from "final-form";
import { describe, expect, it, vi } from "vitest";

import type { BlockContext } from "../blocks/context/BlockContext";
import type { BlockInterface } from "../blocks/types";
import { DamImageBlock } from "../dam/blocks/DamImageBlock";
import type { AiModeTool } from "./AiModeToolsets";
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

    it("sets the values as unsaved changes", async () => {
        const { form, call } = createTools();

        expect(await call("set_news_form_values", { values: { title: "Award won", category: "awards" } })).toContain("The changes are unsaved");
        expect(form.getState().values).toMatchObject({ title: "Award won", category: "awards" });
        expect(form.getState().dirty).toBe(true);
    });

    it.each([
        [{ subtitle: "x" }, '"subtitle" is no field this tool can set'],
        [{ date: "31.01.2026" }, '"date" must be an existing date in the format YYYY-MM-DD'],
        [{ date: "2026-13-45" }, '"date" must be an existing date in the format YYYY-MM-DD'],
        [{ date: "2026-02-30" }, '"date" must be an existing date in the format YYYY-MM-DD'],
        [{ date: "2026-1-5" }, '"date" must be an existing date in the format YYYY-MM-DD'],
        [{ category: "sports" }, '"category" must be one of: events, awards'],
        [{ title: 42 }, '"title" must be a string'],
        [{ image: {} }, '"image" is no field this tool can set'],
    ])("refuses %o and changes no field", async (values, message) => {
        const { form, call } = createTools();

        await expect(async () => call("set_news_form_values", { values: { title: "Changed", ...values } })).rejects.toThrow(message);
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

    it("refers the agent to the form's state for the keys of the blocks, not to the page editor's", async () => {
        const { tools, call } = createBlocksTools();

        const { inputSchema } = findTool(tools, "edit_news_form_blocks");
        expect(JSON.stringify(inputSchema)).toContain("get_news_form_state");
        expect(JSON.stringify(inputSchema)).not.toContain("get_page_state");
        await expect(async () => call({ field: "content", operations: [{ operation: "remove" }] })).rejects.toThrow(
            'Operation 1 ("remove") needs a "key", the key of the block to act on, as get_news_form_state reports it.',
        );
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
        ).rejects.toThrow("The field 'content' of the news article changed while the edits were prepared");
        expect(tools.getKeys()).toEqual(["c"]);
    });
});

describe("fields beyond text", () => {
    const countries = [
        { id: "at", label: "Austria" },
        { id: "de", label: "Germany" },
    ];
    const manufacturers = [
        { id: "m1", name: "Alpine", country: "at" },
        { id: "m2", name: "Bavaria", country: "de" },
    ];
    const tags = [
        { id: "t1", title: "New" },
        { id: "t2", title: "Sale" },
    ];

    function createProductTools({
        whileLoadingManufacturers,
    }: { whileLoadingManufacturers?: (form: FormApi<Record<string, unknown>>) => void } = {}) {
        const form = createForm<Record<string, unknown>>({
            onSubmit: vi.fn(),
            initialValues: {
                inStock: false,
                additionalTypes: [],
                manufacturerCountry: countries[0],
                manufacturer: null,
                tags: [],
                address: { street: "Main St" },
            },
        });
        for (const name of ["inStock", "additionalTypes", "manufacturerCountry", "manufacturer", "tags", "address.street"]) {
            form.registerField(name, () => undefined, { value: true });
        }
        const tools = createFormTools({
            entityName: "product",
            entityLabel: "product",
            fields: [
                { name: "inStock", label: "In stock", type: "boolean" },
                {
                    name: "additionalTypes",
                    label: "Additional types",
                    type: "multiSelect",
                    options: [
                        { value: "cap", label: "Cap" },
                        { value: "tie", label: "Tie" },
                    ],
                },
                {
                    name: "manufacturerCountry",
                    label: "Manufacturer country",
                    type: "reference",
                    loadOptions: async () => countries,
                    getOptionLabel: (option) => String(option.label),
                },
                {
                    name: "manufacturer",
                    label: "Manufacturer",
                    type: "reference",
                    // As in the product form, the manufacturers are those of the selected country.
                    loadOptions: async (values) => {
                        whileLoadingManufacturers?.(form);
                        return manufacturers.filter(({ country }) => country === (values.manufacturerCountry as { id: string } | null)?.id);
                    },
                    getOptionLabel: (option) => String(option.name),
                },
                {
                    name: "tags",
                    label: "Tags",
                    type: "reference",
                    multiple: true,
                    loadOptions: async () => tags,
                    getOptionLabel: (option) => String(option.title),
                },
                { name: "address.street", label: "Street", type: "text" },
            ],
            form,
            blockContext: {} as BlockContext,
        });
        const call = (name: string, args: Record<string, unknown>) => findTool(tools, name).handler(args, { clearTextSelection: vi.fn() });
        return { form, tools, call };
    }

    it("lists the options of a reference field by ID and label", async () => {
        const { call } = createProductTools();

        expect(await call("get_product_form_options", { field: "manufacturer" })).toEqual([{ id: "m1", label: "Alpine" }]);
    });

    it("sets references by ID, loading the options with the other values of the same call", async () => {
        const { form, call } = createProductTools();

        await call("set_product_form_values", { values: { manufacturerCountry: "de", manufacturer: "m2", tags: ["t2", "t1"] } });

        expect(form.getState().values).toMatchObject({ manufacturerCountry: countries[1], manufacturer: manufacturers[1], tags: [tags[1], tags[0]] });
    });

    it("refuses the values when the user changed the form while the options were loaded", async () => {
        const { form, call } = createProductTools({ whileLoadingManufacturers: (form) => form.change("manufacturerCountry", countries[1]) });

        await expect(async () => call("set_product_form_values", { values: { manufacturer: "m1", inStock: true } })).rejects.toThrow(
            "The product form changed while the options were loaded. No field was changed.",
        );
        expect(form.getState().values).toMatchObject({ manufacturerCountry: countries[1], manufacturer: null, inStock: false });
    });

    it("reads a reference as the ID and label of the selected option", async () => {
        const { call } = createProductTools();

        expect(await call("get_product_form_state", {})).toMatchObject({
            values: { manufacturerCountry: { id: "at", label: "Austria" }, manufacturer: null },
        });
    });

    it("sets a checkbox, a multi-select, and a nested field", async () => {
        const { form, call } = createProductTools();

        await call("set_product_form_values", { values: { inStock: true, additionalTypes: ["tie"], "address.street": "Side St" } });

        expect(form.getState().values).toMatchObject({ inStock: true, additionalTypes: ["tie"], address: { street: "Side St" } });
    });

    it.each([
        [{ manufacturer: "m2" }, '"m2" is no option of "manufacturer"'],
        [{ tags: "t1" }, '"tags" must be a list of IDs'],
        [{ inStock: "yes" }, '"inStock" must be true or false'],
        [{ additionalTypes: ["shirt"] }, '"additionalTypes" must be a list of: cap, tie'],
    ])("refuses %o and changes no field", async (values, message) => {
        const { form, call } = createProductTools();

        await expect(async () => call("set_product_form_values", { values: { "address.street": "Changed", ...values } })).rejects.toThrow(message);
        expect(form.getState().values).toMatchObject({ address: { street: "Main St" } });
    });
});

describe("a single block field", () => {
    // Converts like a link block that declares the fields "url" and "openInNewWindow".
    const linkBlock = {
        defaultValues: () => ({ url: "", openInNewWindow: false }),
        output2State: async (output: Record<string, unknown>) => ({ url: output.url, openInNewWindow: output.openInNewWindow }),
        state2Output: (state: unknown) => state,
        isValid: async () => true,
        extractTextContents: () => [],
    } as unknown as BlockInterface;

    function createLinkTools({ schemaBlockName }: { schemaBlockName?: string } = {}) {
        const form = createForm<Record<string, unknown>>({
            onSubmit: vi.fn(),
            initialValues: { target: { url: "https://example.com", openInNewWindow: true } },
        });
        form.registerField("target", () => undefined, { value: true });
        const tools = createFormTools({
            entityName: "redirect",
            entityLabel: "redirect",
            fields: [{ name: "target", label: "Target", type: "block", block: linkBlock, schemaBlockName }],
            form,
            blockContext: {} as BlockContext,
        });
        const call = (args: Record<string, unknown>) => findTool(tools, "set_redirect_form_values").handler(args, { clearTextSelection: vi.fn() });
        return { form, tools, call };
    }

    it("sets the block in its saved shape, merged into its current content", async () => {
        const { form, call } = createLinkTools({ schemaBlockName: "RedirectsLink" });

        await call({ values: { target: { url: "https://example.org" } } });

        expect(form.getState().values.target).toEqual({ url: "https://example.org", openInNewWindow: true });
    });

    it("refuses a field the block doesn't have, and names the block to look up", async () => {
        const { form, call } = createLinkTools({ schemaBlockName: "RedirectsLink" });

        await expect(async () => call({ values: { target: { href: "https://example.org" } } })).rejects.toThrow(
            'call get_block_schema for "RedirectsLink"',
        );
        expect(form.getState().values.target).toEqual({ url: "https://example.com", openInNewWindow: true });
    });

    it("can only be read without its name in block-meta", async () => {
        const { tools, call } = createLinkTools();

        expect(findTool(tools, "set_redirect_form_values").description).toContain("The fields target can't be changed.");
        await expect(async () => call({ values: { target: { url: "https://example.org" } } })).rejects.toThrow(
            '"target" is no field this tool can set',
        );
    });
});
