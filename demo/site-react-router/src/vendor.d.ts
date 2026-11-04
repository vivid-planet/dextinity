/* eslint-disable @typescript-eslint/no-explicit-any */

import "react";

declare module "*.svg" {
    const content: any;
    export = content;
}

declare module "react" {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

declare module "virtual:react-router/server-build" {
    const build: import("react-router").ServerBuild;
    export = build;
}
