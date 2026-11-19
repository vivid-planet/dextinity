import { DamImageBlock } from "@dextinity/cms-admin";
import { createForm } from "final-form";
import { describe, expect, it, vi } from "vitest";

import type { AiModeTool } from "./AiModeToolsets";
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
    const tools = createFormTools({ entityName: "news", entityLabel: "news article", fields, form });
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
