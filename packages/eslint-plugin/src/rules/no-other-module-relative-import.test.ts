import { RuleTester } from "eslint";

import noOtherModuleRelativeImport from "./no-other-module-relative-import.js";

const ruleTester = new RuleTester();

const errors = [{ message: "Avoid relative import from other module" }];

const options = [{ sourceRoot: "./src", sourceRootAlias: "@src" }];

ruleTester.run("no-other-module-relative-import", noOtherModuleRelativeImport, {
    valid: [
        {
            code: `import Bar from "@src/moduleb/Bar";`,
            filename: `${process.cwd()}/src/modulea/Foo.ts`,
            options,
        },
        { code: `import Bar from "../Bar";`, filename: `${process.cwd()}/src/modulea/sub/Foo.ts`, options },
        { code: `import Bar from "xx/bar";`, filename: `${process.cwd()}/src/modulea/Foo.ts`, options },
    ],

    invalid: [
        {
            code: `import Bar from "../moduleb/Bar";`,
            filename: `${process.cwd()}/src/modulea/Foo.ts`,
            options,
            errors,
            output: `import Bar from "@src/moduleb/Bar";`,
        },
        {
            code: `import Bar from "../../Bar";`,
            filename: `${process.cwd()}/src/modulea/sub/Foo.ts`,
            options,
            errors,
            output: `import Bar from "@src/Bar";`,
        },
    ],
});
