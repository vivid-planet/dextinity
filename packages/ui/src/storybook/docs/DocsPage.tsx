import { Controls, Description, Heading, Primary, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

import { Rules, type RulesDefinition } from "./Rules";
import { TokenTable } from "./TokenTable";

function useMetaParameters(): Record<string, unknown> {
    const resolvedOf = useOf("meta", ["meta"]);
    return resolvedOf.type === "meta" ? resolvedOf.preparedMeta.parameters : {};
}

function ComponentTokens() {
    const { tokens } = useMetaParameters();

    if (typeof tokens !== "string") {
        return null;
    }

    return (
        <>
            <Heading>CSS variables</Heading>
            <TokenTable tokens={tokens} />
        </>
    );
}

function isRulesDefinition(value: unknown): value is RulesDefinition {
    return typeof value === "object" && value !== null && "dos" in value && "donts" in value;
}

function ComponentRules() {
    const { rules } = useMetaParameters();

    if (!isRulesDefinition(rules)) {
        return null;
    }

    return (
        <>
            <Heading>Rules</Heading>
            <Rules dos={rules.dos} donts={rules.donts} />
        </>
    );
}

/**
 * The autodocs page, in the order of the design system draft: description, examples, CSS variables (`parameters.tokens`), props, and
 * rules (`parameters.rules`).
 */
export function DocsPage() {
    return (
        <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <Stories />
            <ComponentTokens />
            <Heading>Props</Heading>
            <Controls />
            <ComponentRules />
        </>
    );
}
