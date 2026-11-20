import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { LabelHTMLAttributes } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FieldLabel } from "../FieldLabel";

function CustomLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label {...props} />;
}

/**
 * Compile-time contract for the label slot. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function FieldLabelLabelSlotTypeContract() {
    return (
        <>
            <FieldLabel slots={{ label: CustomLabel }}>Label</FieldLabel>
            {/* @ts-expect-error the slot receives a ref typed for a label, which an output does not accept */}
            <FieldLabel slots={{ label: "output" }}>Label</FieldLabel>
            {/* @ts-expect-error the slot receives `htmlFor`, which a legend does not accept */}
            <FieldLabel slots={{ label: "legend" }}>Label</FieldLabel>
        </>
    );
}

afterEach(cleanup);

describe("FieldLabel", () => {
    it("keeps the asterisk and the info button out of the accessible name of the labeled field", () => {
        render(
            <>
                <FieldLabel htmlFor="title" required info="Shown in search results." infoId="title-info">
                    Title
                </FieldLabel>
                <input id="title" aria-describedby="title-info" />
            </>,
        );

        expect(screen.getByRole("textbox", { name: "Title" })).toHaveAccessibleDescription("Shown in search results.");
    });

    it("puts a focusable info button right after the label that shows the info in a tooltip on a tap", async () => {
        render(
            <FieldLabel htmlFor="title" info="Shown in search results." labels={{ infoButton: "Mehr Informationen" }}>
                Title
            </FieldLabel>,
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
            <FieldLabel id="title-label" error required className="consumer-class" style={{ marginBlockEnd: "4px" }}>
                Title
            </FieldLabel>,
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
            <FieldLabel className="consumer-class" slotProps={{ root: { title: "Root", className: "slot-class" } }}>
                Title
            </FieldLabel>,
        );

        const root = screen.getByText("Title").parentElement;
        expect([
            root?.title,
            root?.className.includes("consumer-class"),
            root?.className.includes("slot-class"),
            root?.className.includes("dextinityFieldLabel"),
        ]).toStrictEqual(["Root", true, true, true]);
    });
});
