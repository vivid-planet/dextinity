import { Controls, Description, Heading, Primary, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

import type { TokenDefinition } from "./parseTokens";
import { TokenTable } from "./TokenTable";

function isTokenDefinitionList(value: unknown): value is TokenDefinition[] {
    return (
        Array.isArray(value) &&
        value.every(
            (token) =>
                typeof token === "object" &&
                token !== null &&
                "name" in token &&
                typeof token.name === "string" &&
                "definition" in token &&
                typeof token.definition === "string",
        )
    );
}

function ComponentTokens() {
    const resolvedOf = useOf("meta", ["meta"]);
    const tokens: unknown = resolvedOf.type === "meta" ? resolvedOf.preparedMeta.parameters.componentTokens : undefined;

    if (!isTokenDefinitionList(tokens) || tokens.length === 0) {
        return null;
    }

    return (
        <>
            <Heading>Tokens</Heading>
            <TokenTable tokens={tokens} />
        </>
    );
}

/**
 * The autodocs page: description, the default story with its props, the other stories, and at the very bottom the tokens that the
 * component reads (from `parameters.componentTokens`, which `componentTokensPlugin` adds).
 */
export function DocsPage() {
    return (
        <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <Heading>Props</Heading>
            <Controls />
            <Stories includePrimary={false} />
            <ComponentTokens />
        </>
    );
}
