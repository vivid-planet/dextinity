import { isValidElement } from "react";

import { argsSpreadMarkerPattern, childrenPlaceholder } from "./renderSourceMarkers";

export type ShownArg = { value: unknown } | { source: string };

type RenderSourceContext = {
    parameters: {
        renderSource?: unknown;
        writtenArgs?: Record<string, ShownArg>;
        writtenMappingOptions?: Record<string, Record<string, ShownArg>>;
    };
    args: Record<string, unknown>;
    initialArgs: Record<string, unknown>;
    argTypes: Record<string, { mapping?: Record<string, unknown> }>;
};

const childrenPlaceholderPattern = new RegExp(`>${childrenPlaceholder}(</[\\w.]+>)`, "g");

/**
 * The `docs.source.transform` of the Storybook. Writes the args into a story's `renderSource`: as written in the story file, or
 * as their values once the reader changes them in the Controls panel.
 */
export function renderSourceWithArgs(storybookSource: string, context: RenderSourceContext) {
    const { parameters, args } = context;
    if (typeof parameters.renderSource !== "string") {
        return storybookSource;
    }
    const shownArgs: Record<string, ShownArg> = {};
    for (const name of Object.keys(args)) {
        const shownArg = shownArgOf(name, args[name], context);
        if (shownArg === undefined) {
            return storybookSource;
        }
        shownArgs[name] = shownArg;
    }
    return renderSourceWithShownArgs(parameters.renderSource, shownArgs);
}

function shownArgOf(name: string, value: unknown, { parameters, initialArgs, argTypes }: RenderSourceContext) {
    const mapping = argTypes[name]?.mapping;
    if (mapping && typeof value === "string" && value in mapping) {
        return parameters.writtenMappingOptions?.[name]?.[value] ?? shownValueOf(mapping[value]);
    }
    const writtenArg = value === initialArgs[name] ? parameters.writtenArgs?.[name] : undefined;
    return writtenArg ?? shownValueOf(value);
}

function shownValueOf(value: unknown): ShownArg | undefined {
    return containsElement(value) ? undefined : { value };
}

function containsElement(value: unknown): boolean {
    if (isValidElement(value)) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.some(containsElement);
    }
    return typeof value === "object" && value !== null && Object.values(value).some(containsElement);
}

function renderSourceWithShownArgs(renderSource: string, { children, ...attributeArgs }: Record<string, ShownArg>) {
    const withAttributes = renderSource.replace(argsSpreadMarkerPattern, (_, overriddenArgNames: string) => {
        const leftOutNames = overriddenArgNames.trim().split(" ");
        return Object.entries(attributeArgs)
            .filter(([name]) => !leftOutNames.includes(name))
            .map(([name, shownArg]) => jsxAttributeSource(name, shownArg))
            .filter((attribute) => attribute !== undefined)
            .map((attribute) => ` ${attribute}`)
            .join("");
    });
    return replaceChildrenPlaceholder(withAttributes, children && jsxChildrenSource(children));
}

function jsxAttributeSource(name: string, shownArg: ShownArg) {
    if ("source" in shownArg) {
        return `${name}={${shownArg.source}}`;
    }
    const { value } = shownArg;
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

function jsxChildrenSource(shownArg: ShownArg) {
    if ("source" in shownArg) {
        return /^<.*>$/s.test(shownArg.source) ? shownArg.source : `{${shownArg.source}}`;
    }
    const { value } = shownArg;
    if (typeof value === "number") {
        return String(value);
    }
    if (typeof value === "string") {
        return /[{}<>&]/.test(value) ? `{${JSON.stringify(value)}}` : value;
    }
    return undefined;
}

function replaceChildrenPlaceholder(source: string, childrenSource: string | undefined) {
    return source.replace(childrenPlaceholderPattern, (_, closingTag: string) =>
        childrenSource === undefined ? " />" : `>${childrenSource}${closingTag}`,
    );
}
