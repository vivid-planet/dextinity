import { RuleTester } from "eslint";

import noPrivateSiblingImport from "./no-private-sibling-import.js";

const ruleTester = new RuleTester();

const errors = [{ message: "Avoid private sibling import from other files" }];

const options = [["gql", "sc", "gql.generated"]];

ruleTester.run("can't import from private .gql.ts", noPrivateSiblingImport, {
    valid: [
        { code: `import FooGql from "./Foo.gql";`, filename: "/path/to/Foo.ts" },
        { code: `import FooGql from "./Foo.gql";`, filename: "/path/to/Foo.tsx" },
    ],
    invalid: [
        { code: `import BarGql from "./Bar.gql";`, filename: "/path/to/Foo.ts", errors },
        { code: `import BarGql from "./Bar.gql";`, filename: "/path/to/Foo.tsx", errors },
    ],
});

ruleTester.run("can't import from private .sc.ts", noPrivateSiblingImport, {
    valid: [
        { code: `import FooSc from "./Foo.sc";`, filename: "/path/to/Foo.ts" },
        { code: `import FooSc from "./Foo.sc";`, filename: "/path/to/Foo.tsx" },
    ],
    invalid: [
        { code: `import BarSc from "./Bar.sc";`, filename: "/path/to/Foo.ts", errors },
        { code: `import BarSc from "./Bar.sc";`, filename: "/path/to/Foo.tsx", errors },
    ],
});

ruleTester.run("can override extensions -> can't import from private .gql.generated.ts", noPrivateSiblingImport, {
    valid: [{ code: `import FooGql from "./Foo.gql.generated";`, filename: "/path/to/Foo.ts", options }],
    invalid: [{ code: `import BarGql from "./Bar.gql.generated";`, filename: "/path/to/Foo.ts", options, errors }],
});

ruleTester.run("can't import from private .loader.gql.ts", noPrivateSiblingImport, {
    valid: [{ code: `import FooGql from "./FooBlock.loader.gql";`, filename: "/path/to/FooBlock.loader.ts" }],
    invalid: [
        { code: `import BarGql from "./BarBlock.loader.gql";`, filename: "/path/to/FooBlock.loader.ts", errors },
        { code: `import BarGql from "./FooBlock.loader.gql";`, filename: "/path/to/FooBlock.ts", errors },
    ],
});
