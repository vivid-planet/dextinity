import { describe, expect, it } from "vitest";

import { LABEL_ANNOTATION, PARENT_CRON_JOB_LABEL } from "./kubernetes.constants";
import { getAnnotation, getLabel, toLegacyLabelSelector, toLegacyName } from "./kubernetes-metadata";

describe("kubernetes-metadata", () => {
    describe("getAnnotation", () => {
        it("should read the dextinity.com annotation", () => {
            const resource = { metadata: { annotations: { "dextinity.com/label": "Demo Cron Job" } } };
            expect(getAnnotation(resource, LABEL_ANNOTATION)).toBe("Demo Cron Job");
        });

        it("should fall back to the legacy annotation", () => {
            const resource = { metadata: { annotations: { "comet-dxp.com/label": "Demo Cron Job" } } };
            expect(getAnnotation(resource, LABEL_ANNOTATION)).toBe("Demo Cron Job");
        });

        it("should prefer the dextinity.com annotation over the legacy annotation", () => {
            const resource = { metadata: { annotations: { "dextinity.com/label": "New", "comet-dxp.com/label": "Legacy" } } };
            expect(getAnnotation(resource, LABEL_ANNOTATION)).toBe("New");
        });

        it("should return undefined if neither annotation is present", () => {
            expect(getAnnotation({ metadata: {} }, LABEL_ANNOTATION)).toBeUndefined();
        });
    });

    describe("getLabel", () => {
        it("should fall back to the legacy label", () => {
            const resource = { metadata: { labels: { "comet-dxp.com/parent-cron-job": "builder" } } };
            expect(getLabel(resource, PARENT_CRON_JOB_LABEL)).toBe("builder");
        });
    });

    describe("toLegacyLabelSelector", () => {
        it("should rewrite all dextinity.com labels", () => {
            expect(toLegacyLabelSelector("dextinity.com/builder = true, dextinity.com/instance = main")).toBe(
                "comet-dxp.com/builder = true, comet-dxp.com/instance = main",
            );
        });

        it("should return undefined for selectors without dextinity.com labels", () => {
            expect(toLegacyLabelSelector("job-name=main-builder")).toBeUndefined();
        });
    });

    describe("toLegacyName", () => {
        it("should not change names without the dextinity.com prefix", () => {
            expect(toLegacyName("job-name")).toBe("job-name");
        });
    });
});
