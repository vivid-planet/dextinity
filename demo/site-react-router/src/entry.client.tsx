import { reportError } from "@src/util/reportError";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
    hydrateRoot(
        document,
        <StrictMode>
            <HydratedRouter onError={reportError} />
        </StrictMode>,
    );
});
