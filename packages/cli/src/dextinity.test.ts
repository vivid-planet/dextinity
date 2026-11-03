import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const executable = join(__dirname, "../bin/dextinity.js");

describe("dextinity executable", () => {
    let workingDirectory: string;

    beforeEach(() => {
        workingDirectory = fs.mkdtempSync(join(os.tmpdir(), "dextinity-"));
    });

    afterEach(() => {
        fs.rmSync(workingDirectory, { recursive: true });
    });

    it("should load TypeScript site configs with extensionless imports in a project without tsconfig.json", () => {
        fs.writeFileSync(
            join(workingDirectory, "main.ts"),
            `export default { name: "main", domains: { main: "example.com" }, preloginEnabled: false };`,
        );
        fs.writeFileSync(join(workingDirectory, "site-configs.ts"), `import main from "./main";\nexport default (env: string) => [main];`);
        fs.writeFileSync(join(workingDirectory, "template.env"), "PUBLIC={{ site://configs/public/dev }}");

        execFileSync(process.execPath, [executable, "inject-site-configs", "-f", "site-configs.ts", "-i", "template.env", "-o", "out.env"], {
            cwd: workingDirectory,
            stdio: "pipe",
        });

        const output = fs.readFileSync(join(workingDirectory, "out.env")).toString();
        expect(JSON.parse(output.split("=")[1])).toEqual([
            { name: "main", domains: { main: "example.com" }, preloginEnabled: false, url: "https://example.com" },
        ]);
    });
});
