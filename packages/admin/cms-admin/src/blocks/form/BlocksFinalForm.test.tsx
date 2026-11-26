import { Field } from "react-final-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen } from "../../testing/test-utils";
import { BlocksFinalForm } from "./BlocksFinalForm";

type FormValues = { text: string };

function TestForm({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
    return (
        <BlocksFinalForm<FormValues> onSubmit={onSubmit} initialValues={{ text: "" }}>
            <Field name="text" component="input" aria-label="Text" />
        </BlocksFinalForm>
    );
}

describe("BlocksFinalForm", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calls the latest onSubmit once per values change while the form stays dirty", () => {
        const staleOnSubmit = vi.fn();
        const { rerender } = render(<TestForm onSubmit={staleOnSubmit} />);

        act(() => {
            fireEvent.change(screen.getByLabelText("Text"), { target: { value: "a" } });
        });

        const latestOnSubmit = vi.fn();
        rerender(<TestForm onSubmit={vi.fn()} />);
        rerender(<TestForm onSubmit={vi.fn()} />);
        rerender(<TestForm onSubmit={latestOnSubmit} />);

        act(() => {
            vi.runAllTimers();
        });

        expect(staleOnSubmit).not.toHaveBeenCalled();
        expect(latestOnSubmit).toHaveBeenCalledTimes(1);
        expect(latestOnSubmit).toHaveBeenLastCalledWith({ text: "a" }, expect.anything());

        rerender(<TestForm onSubmit={latestOnSubmit} />);
        rerender(<TestForm onSubmit={latestOnSubmit} />);

        act(() => {
            vi.runAllTimers();
        });

        expect(latestOnSubmit).toHaveBeenCalledTimes(1);

        act(() => {
            fireEvent.change(screen.getByLabelText("Text"), { target: { value: "ab" } });
        });
        rerender(<TestForm onSubmit={latestOnSubmit} />);

        act(() => {
            vi.runAllTimers();
        });

        expect(latestOnSubmit).toHaveBeenCalledTimes(2);
        expect(latestOnSubmit).toHaveBeenLastCalledWith({ text: "ab" }, expect.anything());
    });
});
