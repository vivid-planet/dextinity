import { RuleTester } from "eslint";

import noNextPublicEnv from "./no-next-public-env";

const ruleTester = new RuleTester();

const errors = [
    {
        message:
            "Usage of process.env.NEXT_PUBLIC_* is not allowed. Use site configs or a custom provider instead. See https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site",
    },
];

ruleTester.run("can't read NEXT_PUBLIC_ environment variables", noNextPublicEnv, {
    valid: [
        { code: "const apiUrl = process.env.API_URL;" },
        { code: 'const apiUrl = process.env["API_URL"];' },
        { code: "const { API_URL } = process.env;" },
        { code: "const value = config.env.NEXT_PUBLIC_API_URL;" },
        { code: "const value = process.env[name];" },
    ],
    invalid: [
        { code: "const apiUrl = process.env.NEXT_PUBLIC_API_URL;", errors },
        { code: 'const apiUrl = process.env["NEXT_PUBLIC_API_URL"];', errors },
        { code: 'const apiUrl = process["env"].NEXT_PUBLIC_API_URL;', errors },
        { code: "const { NEXT_PUBLIC_API_URL } = process.env;", errors },
        { code: "const { NEXT_PUBLIC_API_URL: apiUrl, API_KEY } = process.env;", errors },
    ],
});
