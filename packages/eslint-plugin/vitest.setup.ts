import { RuleTester } from "eslint";
import { describe, it } from "vitest";

// Wire ESLint's RuleTester to vitest's describe/it so rule tests surface as individual test cases.
// See https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
