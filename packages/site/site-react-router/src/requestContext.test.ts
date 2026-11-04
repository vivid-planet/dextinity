// @vitest-environment node
import { createContext, RouterContextProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { getRequestContext, requestContextMiddleware } from "./requestContext.js";

const valueContext = createContext("default");

describe("requestContextMiddleware", () => {
    it("makes the context of the request available while handling the request", async () => {
        const context = new RouterContextProvider();
        context.set(valueContext, "value of the request");

        const response = await requestContextMiddleware({ context } as never, async () => {
            await Promise.resolve();
            return new Response(getRequestContext().get(valueContext));
        });

        expect(await (response as Response).text()).toBe("value of the request");
    });

    it("isn't available outside of a request", () => {
        expect(() => getRequestContext()).toThrow("only available while rendering a request");
    });
});
