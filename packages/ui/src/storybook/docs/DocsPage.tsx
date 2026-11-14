import { Controls, Description, Heading, Primary, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

import { TokenTable } from "./TokenTable";

function ComponentTokens() {
    const resolvedOf = useOf("meta", ["meta"]);
    const tokens: unknown = resolvedOf.type === "meta" ? resolvedOf.preparedMeta.parameters.tokens : undefined;

    if (typeof tokens !== "string") {
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
 * The autodocs page: description, the default story with its props, the other stories, and at the very bottom the component's tokens (from `parameters.tokens`).
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
