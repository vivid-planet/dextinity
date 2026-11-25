import { ChangeSetType } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { ActionLogType } from "./dto/action-log-type.enum.js";
import { getActionLogType } from "./get-action-log-type.js";

describe("getActionLogType", () => {
    it("returns created for a created entity", () => {
        expect(getActionLogType(ChangeSetType.CREATE)).toBe(ActionLogType.created);
    });

    // An entity that existed before its class was logged has no earlier action log, so the first entry isn't a creation.
    it("returns updated for an updated entity", () => {
        expect(getActionLogType(ChangeSetType.UPDATE)).toBe(ActionLogType.updated);
    });

    it("returns deleted for a deleted entity", () => {
        expect(getActionLogType(ChangeSetType.DELETE)).toBe(ActionLogType.deleted);
        expect(getActionLogType(ChangeSetType.DELETE_EARLY)).toBe(ActionLogType.deleted);
    });
});
