import { type Rule } from "eslint";

const message =
    "Usage of process.env.NEXT_PUBLIC_* is not allowed. Use site configs or a custom provider instead. See https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site";

const nextPublicPrefix = "NEXT_PUBLIC_";

type SyntaxNode = {
    type: string;
    name?: unknown;
    value?: unknown;
    object?: SyntaxNode;
    property?: SyntaxNode;
    computed?: boolean;
};

function getStaticName(key: SyntaxNode, isComputed: boolean): string | undefined {
    if (!isComputed && key.type === "Identifier" && typeof key.name === "string") {
        return key.name;
    }
    if (key.type === "Literal" && typeof key.value === "string") {
        return key.value;
    }
    return undefined;
}

function isProcessEnv(node: SyntaxNode): boolean {
    return (
        node.type === "MemberExpression" &&
        node.object?.type === "Identifier" &&
        node.object.name === "process" &&
        node.property !== undefined &&
        getStaticName(node.property, node.computed === true) === "env"
    );
}

export default {
    meta: {
        type: "problem",
        schema: [],
    },
    create(context) {
        return {
            MemberExpression(node) {
                if (isProcessEnv(node.object) && getStaticName(node.property, node.computed)?.startsWith(nextPublicPrefix)) {
                    context.report({ node, message });
                }
            },
            VariableDeclarator(node) {
                if (node.id.type !== "ObjectPattern" || !node.init || !isProcessEnv(node.init)) {
                    return;
                }
                for (const property of node.id.properties) {
                    if (property.type === "Property" && getStaticName(property.key, property.computed)?.startsWith(nextPublicPrefix)) {
                        context.report({ node: property, message });
                    }
                }
            },
        };
    },
} as Rule.RuleModule;
