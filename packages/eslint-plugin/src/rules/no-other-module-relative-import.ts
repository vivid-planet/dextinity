import { type Rule } from "eslint";
import path from "path";

function parentDirCount(dir: string) {
    const match = dir.match(/^(\.\.\/)*/);
    return (match?.[0].length ?? 0) / 3;
}

export default {
    meta: {
        type: "suggestion",
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    sourceRoot: {
                        type: "string",
                    },
                    sourceRootAlias: {
                        type: "string",
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        return {
            ImportDeclaration: function (node) {
                const options = context.options[0] ?? { sourceRoot: "./src", sourceRootAlias: "@src" };

                // An import source is always a string literal
                if (typeof node.source.value !== "string") return;
                const importPath = node.source.value;

                const importParentDirCount = parentDirCount(importPath);
                if (!importParentDirCount) {
                    // import is not relative
                    return;
                }

                const filePath = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
                if (filePath == "<text>") return; // If the input is from stdin, this test can't fail
                const sourceDir = `${context.getCwd()}/${options.sourceRoot}`;

                const fileDir = path.dirname(filePath);

                const relativeFileToSourceDir = path.relative(sourceDir, fileDir);
                if (!relativeFileToSourceDir || relativeFileToSourceDir.startsWith("..")) {
                    // file is not in source directory
                    return;
                }

                const fileSubdirectoriesCount = relativeFileToSourceDir.split(path.sep).length;

                // importParentDirCount is the number of ../ parts in the import path
                // fileSubdirectoriesCount is the number of subdirectories in the file path relative to the source directory
                if (importParentDirCount >= fileSubdirectoriesCount) {
                    context.report({
                        node,
                        message: "Avoid relative import from other module",
                        fix: (fixer) => {
                            const importPathRelativeToSourceDir = path.relative(sourceDir, `${fileDir}/${importPath}`);
                            return fixer.replaceText(node.source, `"${options.sourceRootAlias}/${importPathRelativeToSourceDir}"`);
                        },
                    });
                }
            },
        };
    },
} as Rule.RuleModule;
