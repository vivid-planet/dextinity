export function generateGqlQueryTreeFromFields(fields: string[]) {
    type FieldsObjectType = {
        children: { [key: string]: FieldsObjectType };
        fragments: string[];
    };

    // Helper to get or create a node at a given path
    function getOrCreateNode(root: FieldsObjectType, path: string[]): FieldsObjectType {
        let node = root;
        for (const part of path) {
            if (!node.children[part]) {
                node.children[part] = { children: {}, fragments: [] };
            }
            node = node.children[part];
        }
        return node;
    }

    // 1. create tree out of dot separated fields
    const root: FieldsObjectType = { children: {}, fragments: [] };
    for (const field of fields) {
        const fragmentMatch = field.match(/(.*)(\.{3}.*)/);
        if (fragmentMatch) {
            // e.g. foo.bar...Fragment
            const key = fragmentMatch[1].trim();
            const fragment = fragmentMatch[2].trim();
            if (key === "") {
                root.fragments.push(fragment);
            } else {
                const path = key.split(".").filter(Boolean);
                const node = getOrCreateNode(root, path);
                node.fragments.push(fragment);
            }
        } else {
            // e.g. foo.bar.baz
            const path = field.split(".").filter(Boolean);
            if (path.length === 0) {
                continue;
            }
            // Mark the leaf node (no need to store field names, just ensure the path exists)
            getOrCreateNode(root, path);
        }
    }

    // 2. create fragment string out of tree
    function recursiveStringify(node: FieldsObjectType): string {
        const parts: string[] = [];
        // Add fields (children)
        for (const key of Object.keys(node.children)) {
            const child = node.children[key];
            const childStr = recursiveStringify(child);
            if (childStr) {
                parts.push(`${key} { ${childStr} }`);
            } else {
                parts.push(key);
            }
        }
        // Add fragments
        if (node.fragments.length > 0) {
            parts.push(...node.fragments);
        }
        return parts.join(" ");
    }
    return recursiveStringify(root);
}
export function generateGqlOperation(options: {
    type: "query" | "mutation";
    operationName: string;
    rootOperation: string;
    variables?: {
        name: string;
        type: string;
    }[];
    fields: string[];
    fragmentVariables?: string[];
}) {
    let queryArgs = "";
    if (options.variables && options.variables.length > 0) {
        queryArgs += `(`;
        queryArgs += options.variables.map((v) => `$${v.name}: ${v.type}`).join(", ");
        queryArgs += `)`;
    }

    let rootQueryArgs = "";
    if (options.variables && options.variables.length > 0) {
        rootQueryArgs += `(`;
        rootQueryArgs += options.variables.map((v) => `${v.name}: $${v.name}`).join(", ");
        rootQueryArgs += `)`;
    }

    return `
    ${options.type} ${options.operationName}${queryArgs} {
        ${options.rootOperation}${rootQueryArgs} {
            ${generateGqlQueryTreeFromFields(options.fields)}
        }
    }
    ${(options.fragmentVariables ?? []).join("\n")}
    `;
}
