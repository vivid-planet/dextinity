import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { LabelHTMLAttributes } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FormLabel } from "../FormLabel";

function CustomLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label {...props} />;
}

/**
 * Compile-time contract for the label slot. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function FormLabelLabelSlotTypeContract() {
    return (
        <>
            <FormLabel slots={{ label: CustomLabel }}>Label</FormLabel>
            {/* @ts-expect-error the slot receives a ref typed for a label, which an output does not accept */}
            <FormLabel slots={{ label: "output" }}>Label</FormLabel>
            {/* @ts-expect-error the slot receives `htmlFor`, which a legend does not accept */}
            <FormLabel slots={{ label: "legend" }}>Label</FormLabel>
        </>
    );
}

afterEach(cleanup);

describe("FormLabel", () => {
    it("keeps the asterisk and the help button out of the accessible name of the labeled field", () => {
        render(
            <>
                <FormLabel htmlFor="title" required helpText="Shown in search results." helpTextId="title-help">
                    Title
                </FormLabel>
                <input id="title" aria-describedby="title-help" />
            </>,
        );

        expect(screen.getByRole("textbox", { name: "Title" })).toHaveAccessibleDescription("Shown in search results.");
    });

    it("puts a focusable info button right after the label that shows the help text in a tooltip on a tap", async () => {
        render(
            <FormLabel htmlFor="title" helpText="Shown in search results." labels={{ helpText: "Mehr Informationen" }}>
                Title
            </FormLabel>,
        );

        const button = screen.getByRole("button", { name: "Mehr Informationen" });
        expect(button.previousElementSibling?.tagName).toBe("LABEL");
        expect(button.closest("label")).toBeNull();
        expect(button.tabIndex).toBe(0);
        expect(button).toHaveAccessibleDescription("Shown in search results.");
        await act(async () => fireEvent.click(button));
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Shown in search results.");
    });

    it("puts the owner state, `className` and `style` on the element around the label, and other props on the label", () => {
        render(
            <FormLabel id="title-label" error required className="consumer-class" style={{ marginBlockEnd: "4px" }}>
                Title
            </FormLabel>,
        );

        const label = screen.getByText("Title");
        const root = label.parentElement;
        expect([
            label.id,
            root?.dataset.error,
            root?.dataset.required,
            root?.className.includes("consumer-class"),
            root?.style.marginBlockEnd,
        ]).toStrictEqual(["title-label", "", "", true, "4px"]);
    });

    it("merges `slotProps.root` into the element around the label without dropping its classes", () => {
        render(
            <FormLabel className="consumer-class" slotProps={{ root: { title: "Root", className: "slot-class" } }}>
                Title
            </FormLabel>,
        );

        const root = screen.getByText("Title").parentElement;
        expect([
            root?.title,
            root?.className.includes("consumer-class"),
            root?.className.includes("slot-class"),
            root?.className.includes("dextinityFormLabel"),
        ]).toStrictEqual(["Root", true, true, true]);
    });
});
