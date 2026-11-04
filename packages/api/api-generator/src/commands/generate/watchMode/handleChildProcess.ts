import type { ChildProcessWithoutNullStreams } from "child_process";

export function handleChildProcess(child: ChildProcessWithoutNullStreams): Promise<string> {
    return new Promise((resolve, reject) => {
        let scriptOutput = "";
        let errorOutput = "";
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (data) => {
            scriptOutput += data;
            console.log(data);
        });
        child.stderr.on("data", (data) => {
            errorOutput += data;
            console.error(data);
        });

        child.on("close", (code) => {
            if (code !== 0) {
                reject(errorOutput);
            } else {
                resolve(scriptOutput);
            }
        });
    });
}
