import "virtual:react-router/unstable_rsc/inject-hmr-runtime";

import { createFromReadableStream, createTemporaryReferenceSet, encodeReply, setServerCallback } from "@vitejs/plugin-rsc/browser";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
    unstable_createCallServer as createCallServer,
    unstable_getRSCStream as getRSCStream,
    unstable_RSCHydratedRouter as RSCHydratedRouter,
    type unstable_RSCPayload as RSCPayload,
} from "react-router/dom";

import { reportError } from "./util/reportError";

setServerCallback(createCallServer({ createFromReadableStream, createTemporaryReferenceSet, encodeReply }));

createFromReadableStream<RSCPayload>(getRSCStream()).then((payload) => {
    startTransition(async () => {
        const formState = payload.type === "render" ? await payload.formState : undefined;

        hydrateRoot(
            document,
            <StrictMode>
                <RSCHydratedRouter createFromReadableStream={createFromReadableStream} payload={payload} />
            </StrictMode>,
            { formState, onCaughtError: reportError, onUncaughtError: reportError, onRecoverableError: reportError },
        );
    });
});
