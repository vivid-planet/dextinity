#!/usr/bin/env node
// Projects without a tsconfig.json get @tsconfig/node16's defaults, which switched to `module: Node16` in 1.0.4 and break extensionless imports.
require("ts-node").register({ compilerOptions: { module: "commonjs" } });
require("../lib/dextinity");
