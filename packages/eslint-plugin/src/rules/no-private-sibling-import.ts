import { type Rule } from "eslint";
import path from "path";

export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "Allow a private sibling file (`Foo.gql.ts`, `Foo.sc.ts`) to be imported only by the file it belongs to",
            url: "https://github.com/vivid-planet/dextinity/blob/main/packages/eslint-plugin/docs/rules/no-private-sibling-import.md",
        },
        schema: [
            {
                type: "array",
                description: "List of private sibling file extensions, defaults to gql, sc",
                items: {
                    type: "string",
                },
            },
        ],
    },
    create(context) {
        return {
            ImportDeclaration: function (node) {
                const optionSiblingExtensions = context.options[0] ?? ["gql", "sc"];
                const filePath = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
                if (filePath == "<text>") return; // If the input is from stdin, this test can't fail
                const isPrivateFileMatch = String(node.source.value).match(new RegExp(`^(.*)\\.(${optionSiblingExtensions.join("|")})$`));
                if (isPrivateFileMatch) {
                    if (!isPrivateFileMatch[1].startsWith("./")) {
                        context.report({
                            node,
                            message: "Import private siblings always with relative imports",
                        });
                    } else {
                        let baseName = path.basename(filePath);
                        if (baseName.endsWith(".tsx")) {
                            baseName = baseName.slice(0, -4);
                        } else if (baseName.endsWith(".ts")) {
                            baseName = baseName.slice(0, -3);
                        }

                        for (const ext of optionSiblingExtensions) {
                            const suffix = `.${ext}`;
                            if (baseName.endsWith(suffix)) {
                                baseName = baseName.slice(0, -suffix.length);
                                break;
                            }
                        }

                        if (isPrivateFileMatch[1] != `./${baseName}`) {
                            context.report({
                                node,
                                message: "Avoid private sibling import from other files",
                            });
                        }
                    }
                }
            },
        };
    },
} as Rule.RuleModule;
