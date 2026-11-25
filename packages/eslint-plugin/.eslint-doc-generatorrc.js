import prettier from "prettier";

/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
    ruleDocNotices: ["description", "deprecated", "fixableAndHasSuggestions"],
    ruleListColumns: ["name", "description", "fixable", "hasSuggestions", "options", "deprecated"],
    postprocess: async (content, path) => prettier.format(content, { ...(await prettier.resolveConfig(path)), parser: "markdown" }),
};

export default config;
