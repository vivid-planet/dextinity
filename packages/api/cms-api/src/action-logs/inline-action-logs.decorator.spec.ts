import { describe, expect, it } from "vitest";

import { INLINE_ACTION_LOGS_METADATA_KEY, InlineActionLogs, type InlineActionLogsMetadata } from "./inline-action-logs.decorator";

function getInlineRelations(target: object): InlineActionLogsMetadata | undefined {
    return Reflect.getMetadata(INLINE_ACTION_LOGS_METADATA_KEY, target);
}

describe("InlineActionLogs", () => {
    it("stores the decorated relation name as metadata", () => {
        class Entity {
            @InlineActionLogs()
            colors: unknown[] = [];
        }

        expect(getInlineRelations(Entity.prototype)).toEqual(["colors"]);
    });

    it("collects multiple decorated relations", () => {
        class Entity {
            @InlineActionLogs()
            colors: unknown[] = [];

            @InlineActionLogs()
            tags: unknown[] = [];
        }

        expect(getInlineRelations(Entity.prototype)).toEqual(["colors", "tags"]);
    });

    it("does not add metadata to entities without the decorator", () => {
        class Entity {
            colors: unknown[] = [];
        }

        expect(getInlineRelations(Entity.prototype)).toBeUndefined();
    });
});
