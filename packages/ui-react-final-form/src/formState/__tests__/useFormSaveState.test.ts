import { describe, expect, it } from "vitest";

import { hasUnsavedChanges, toSaveState } from "../useFormSaveState";

const pristine = { submitting: false, dirty: false, dirtySinceLastSubmit: false, submitSucceeded: false, hasSubmitErrors: false };

describe("toSaveState", () => {
    it("is saved without changes", () => {
        expect(toSaveState(pristine)).toBe("saved");
    });

    it("is dirty with changes", () => {
        expect(toSaveState({ ...pristine, dirty: true })).toBe("dirty");
    });

    it("is saving while submitting", () => {
        expect(toSaveState({ ...pristine, dirty: true, submitting: true })).toBe("saving");
    });

    it("is saved after a successful submit, even if the initial values were kept", () => {
        expect(toSaveState({ ...pristine, dirty: true, submitSucceeded: true })).toBe("saved");
        expect(toSaveState({ ...pristine, dirty: true, submitSucceeded: true, dirtySinceLastSubmit: true })).toBe("dirty");
    });

    it("is an error after a failed submit until the next change", () => {
        expect(toSaveState({ ...pristine, dirty: true, hasSubmitErrors: true })).toBe("error");
        expect(toSaveState({ ...pristine, dirty: true, hasSubmitErrors: true, dirtySinceLastSubmit: true })).toBe("dirty");
    });
});

describe("hasUnsavedChanges", () => {
    it("follows the changes since the last successful submit", () => {
        expect(hasUnsavedChanges(pristine)).toBe(false);
        expect(hasUnsavedChanges({ ...pristine, dirty: true })).toBe(true);
        expect(hasUnsavedChanges({ ...pristine, dirty: true, submitSucceeded: true })).toBe(false);
    });
});
