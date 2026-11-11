import { ArgTypes, Description, Heading, Markdown, Source, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

import { parseTokens } from "./parseTokens";
import { isRules, RulesTable } from "./RulesTable";
import { TokenTable } from "./TokenTable";

function customizationExample(tokens: string) {
    const [firstToken] = parseTokens(tokens);
    if (firstToken == null) {
        return null;
    }
    return `[data-dextinity-brand="acme"] {\n    ${firstToken.name}: …;\n}\n\n.checkout {\n    ${firstToken.name}: …;\n}`;
}

function useMetaParameter(name: string): unknown {
    const resolvedOf = useOf("meta", ["meta"]);
    return resolvedOf.type === "meta" ? resolvedOf.preparedMeta.parameters[name] : undefined;
}

function ComponentRules() {
    const rules = useMetaParameter("rules");

    if (!isRules(rules)) {
        return null;
    }

    return (
        <>
            <Heading>Rules</Heading>
            <RulesTable rules={rules} />
        </>
    );
}

function ComponentTokens() {
    const tokens = useMetaParameter("tokens");

    if (typeof tokens !== "string") {
        return null;
    }

    const example = customizationExample(tokens);

    return (
        <>
            <Heading>Tokens</Heading>
            <Markdown>
                Change the component in your theme by setting these tokens: in a brand's stylesheet for the whole application, or on a class around
                one part of it. See [Customize brand](?path=/docs/foundations-theme-customize-brand--docs).
            </Markdown>
            {example != null && <Source language="css" code={example} />}
            <TokenTable tokens={tokens} />
        </>
    );
}

/**
 * The autodocs page, in the order of the design system draft: description, the component's sections (its stories after the first,
 * which drives the controls), its tokens (from `parameters.tokens`), props, and rules (from `parameters.rules`).
 */
export function DocsPage() {
    return (
        <>
            <Title />
            <Subtitle />
            <Description />
            <Stories title={<span hidden />} includePrimary={false} />
            <ComponentTokens />
            <Heading>Props</Heading>
            <ArgTypes />
            <ComponentRules />
        </>
    );
}
