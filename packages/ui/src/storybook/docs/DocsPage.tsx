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
 * The autodocs page: description, primary example, props, the component's tokens (from `parameters.tokens`), and the remaining stories.
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
            <ComponentTokens />
            <Stories />
        </>
    );
}
