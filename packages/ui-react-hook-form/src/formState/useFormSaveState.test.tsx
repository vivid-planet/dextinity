import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { InputField } from "../inputField/InputField";
import { hasUnsavedChanges, toSaveState, useFormSaveState, useHasUnsavedChanges } from "./useFormSaveState";

const pristine = { isSubmitting: false, isDirty: false, isSubmitted: false, isSubmitSuccessful: false, changedSinceLastSubmit: false };

describe("toSaveState", () => {
    it("is saved without changes", () => {
        expect(toSaveState(pristine)).toBe("saved");
    });

    it("is dirty with changes", () => {
        expect(toSaveState({ ...pristine, isDirty: true, changedSinceLastSubmit: true })).toBe("dirty");
    });

    it("is saving while submitting", () => {
        expect(toSaveState({ ...pristine, isDirty: true, isSubmitting: true })).toBe("saving");
    });

    it("is saved after a successful submit, even if the default values were kept", () => {
        expect(toSaveState({ ...pristine, isDirty: true, isSubmitted: true, isSubmitSuccessful: true })).toBe("saved");
        expect(toSaveState({ ...pristine, isDirty: true, isSubmitted: true, isSubmitSuccessful: true, changedSinceLastSubmit: true })).toBe("dirty");
    });

    it("is an error after a failed submit until the next change", () => {
        expect(toSaveState({ ...pristine, isDirty: true, isSubmitted: true })).toBe("error");
        expect(toSaveState({ ...pristine, isDirty: true, isSubmitted: true, changedSinceLastSubmit: true })).toBe("dirty");
    });
});

describe("hasUnsavedChanges", () => {
    it("follows the changes since the last successful submit", () => {
        expect(hasUnsavedChanges(pristine)).toBe(false);
        expect(hasUnsavedChanges({ ...pristine, isDirty: true })).toBe(true);
        expect(hasUnsavedChanges({ ...pristine, isDirty: true, isSubmitted: true, isSubmitSuccessful: true })).toBe(false);
    });
});

describe("useFormSaveState", () => {
    function TestForm() {
        const { control, handleSubmit, setError } = useForm({ defaultValues: { title: "Benefits" } });
        const { state } = useFormSaveState({ control });
        const hasUnsavedChanges = useHasUnsavedChanges({ control });
        return (
            <form
                onSubmit={handleSubmit(async ({ title }) => {
                    if (title === "Taken") {
                        setError("title", { type: "server", message: "Taken" });
                    }
                })}
            >
                <InputField control={control} name="title" label="Title" />
                <output>{state}</output>
                <output>{hasUnsavedChanges ? "unsaved" : "nothing to save"}</output>
                <button type="submit">Save</button>
            </form>
        );
    }

    it("follows changes, saves, and failed saves of a real form", async () => {
        render(<TestForm />);
        const title = screen.getByLabelText("Title");
        expect(screen.getByText("saved")).toBeInTheDocument();
        expect(screen.getByText("nothing to save")).toBeInTheDocument();

        await userEvent.type(title, "!");
        expect(screen.getByText("dirty")).toBeInTheDocument();
        expect(screen.getByText("unsaved")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(screen.getByText("saved")).toBeInTheDocument());
        expect(screen.getByText("nothing to save")).toBeInTheDocument();

        await userEvent.clear(title);
        await userEvent.type(title, "Taken");
        expect(screen.getByText("dirty")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(screen.getByText("error")).toBeInTheDocument());

        await userEvent.type(title, "!");
        expect(screen.getByText("dirty")).toBeInTheDocument();
    });
});
