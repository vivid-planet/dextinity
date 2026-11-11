import { describe, expect, it } from "vitest";

import { matchRoute } from "./matchRoute";

const routes = [{ path: "/" }, { path: "/archive" }, { path: "/:slug" }];

describe("matchRoute", () => {
    it("should match the root route", () => {
        expect(matchRoute(routes, "/")).toEqual({ route: routes[0], params: {} });
    });

    it("should match a static route before a route with a param", () => {
        expect(matchRoute(routes, "/archive")).toEqual({ route: routes[1], params: {} });
    });

    it("should return the params of the matching route", () => {
        expect(matchRoute(routes, "/my-news")).toEqual({ route: routes[2], params: { slug: "my-news" } });
    });

    it("should not match a path with more segments than the route", () => {
        expect(matchRoute(routes, "/my-news/comments")).toBeUndefined();
    });
});
