import type { Plugin } from "vite";

import { type AccessEmulatorOptions, createAccessEmulator } from "./access-emulator.js";
import { handleImageTransformerRequest } from "./image-transformer-endpoint.js";

export type { DevAccessUser } from "./access-emulator.js";

/**
 * Local development services for the Worker, only active in `vite dev`: an emulator of Cloudflare Access and an image transformer with
 * sharp. Add it before `cloudflare()`, so it handles the requests before they reach the Worker.
 */
export function dextinityDevServer({ accessEmulator }: { accessEmulator: AccessEmulatorOptions }): Plugin {
    return {
        name: "dextinity-dev-server",
        apply: "serve",
        async configureServer(server) {
            const handleAccess = await createAccessEmulator(accessEmulator);
            server.middlewares.use((request, response, next) => {
                const handle = async () => (await handleImageTransformerRequest(request, response)) || handleAccess(request, response);
                handle().then(
                    (isHandled) => {
                        if (!isHandled) {
                            next();
                        }
                    },
                    (error: unknown) => next(error),
                );
            });
        },
    };
}
