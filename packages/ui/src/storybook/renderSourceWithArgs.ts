import { isValidElement } from "react";

import { childrenPlaceholder } from "./childrenPlaceholder";

type RenderSourceContext = {
    parameters: { renderSource?: unknown; docs?: { source?: { type?: string } } };
    args: Record<string, unknown>;
    argTypes: Record<string, { mapping?: Record<string, unknown> }>;
};

const argsSpreadPattern = /\s*\{\s*\.\.\.args\s*\}/g;
const childrenPlaceholderPattern = new RegExp(`>${childrenPlaceholder}(</[\\w.]+>)`, "g");

/**
 * The `docs.source.transform` of the Storybook.
 * Returns a story's `renderSource` parameter with `{...args}` and its children replaced by the current arg values.
 */
export function renderSourceWithArgs(storybookSource: string, { parameters, args, argTypes }: RenderSourceContext) {
    const { renderSource } = parameters;
    const isStorybookSourceRequested = parameters.docs?.source?.type === "code";
    const mappedArgs = Object.fromEntries(Object.entries(args).map(([name, value]) => [name, mappedArgValue(value, argTypes[name]?.mapping)]));
    const hasElementArg = Object.values(mappedArgs).some(isValidElement);
    if (typeof renderSource !== "string" || isStorybookSourceRequested || hasElementArg) {
        return storybookSource;
    }
    const { children, ...attributeArgs } = mappedArgs;
    const withAttributes = replaceWithLiteralText(renderSource, argsSpreadPattern, jsxAttributesSource(attributeArgs));
    return replaceChildrenPlaceholder(withAttributes, jsxChildrenSource(children));
}

function mappedArgValue(value: unknown, mapping: Record<string, unknown> | undefined) {
    return mapping && typeof value === "string" && value in mapping ? mapping[value] : value;
}

function jsxAttributesSource(attributeArgs: Record<string, unknown>) {
    return Object.entries(attributeArgs)
        .map(([name, value]) => jsxAttributeSource(name, value))
        .filter((attribute) => attribute !== undefined)
        .map((attribute) => ` ${attribute}`)
        .join("");
}

function jsxAttributeSource(name: string, value: unknown) {
    if (value === undefined || typeof value === "function") {
        return undefined;
    }
    if (value === true) {
        return name;
    }
    if (typeof value === "string" && !/["&]/.test(value)) {
        return `${name}="${value}"`;
    }
    return `${name}={${JSON.stringify(value)}}`;
}

function jsxChildrenSource(children: unknown) {
    if (typeof children === "number") {
        return String(children);
    }
    if (typeof children === "string") {
        return /[{}<>&]/.test(children) ? `{${JSON.stringify(children)}}` : children;
    }
    return undefined;
}

function replaceChildrenPlaceholder(source: string, childrenSource: string | undefined) {
    return source.replace(childrenPlaceholderPattern, (_, closingTag: string) =>
        childrenSource === undefined ? " />" : `>${childrenSource}${closingTag}`,
    );
}

function replaceWithLiteralText(source: string, pattern: RegExp, text: string) {
    return source.replace(pattern, () => text);
}
