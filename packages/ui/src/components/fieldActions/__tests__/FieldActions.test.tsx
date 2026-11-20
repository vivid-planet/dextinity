import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Input } from "../../input/Input";
import { FieldActions } from "../FieldActions";

afterEach(cleanup);

describe("FieldActions", () => {
    it("emits the shown actions as data attributes and renders one button per action", () => {
        render(<FieldActions data-testid="actions" translate />);

        const actions = screen.getByTestId("actions");
        expect(actions.className).toContain("dextinityFieldActions");
        expect(actions.hasAttribute("data-translate")).toBe(true);
        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toStrictEqual(["Translate"]);
    });

    it("disables the actions of a disabled field", () => {
        render(
            <Field label="Title" disabled actions={<FieldActions translate />}>
                <Input name="title" value="" onChange={vi.fn()} />
            </Field>,
        );

        for (const button of screen.getAllByRole("button")) {
            expect(button).toHaveProperty("disabled", true);
        }
    });

    it("translates with a single click without target locales and shows the field as loading while it runs", async () => {
        let finish: () => void = () => undefined;
        const onTranslate = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
        render(
            <Field label="Title" actions={<FieldActions translate onTranslate={onTranslate} />}>
                <Input name="title" value="Vorteile" onChange={vi.fn()} />
            </Field>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Translate" }));

        expect(onTranslate).toHaveBeenCalledExactlyOnceWith([]);
        expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
        await act(async () => finish());
        await waitFor(() => expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-busy"));
    });

    it("passes the target locales and reports a failed translation", async () => {
        const failure = new Error("Service unavailable");
        const onTranslate = vi.fn(() => Promise.reject(failure));
        const onTranslateError = vi.fn();
        render(
            <Field
                label="Title"
                actions={<FieldActions translate targetLocales={["en", "fr"]} onTranslate={onTranslate} onTranslateError={onTranslateError} />}
            >
                <Input name="title" value="Vorteile" onChange={vi.fn()} />
            </Field>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Translate" }));

        expect(onTranslate).toHaveBeenCalledWith(["en", "fr"]);
        await waitFor(() => expect(onTranslateError).toHaveBeenCalledWith(failure));
        await waitFor(() => expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-busy"));
    });

    it("offers a translation from onTranslateSuggest to accept", async () => {
        const onTranslateAccept = vi.fn();
        render(
            <Field
                label="Title"
                actions={<FieldActions translate onTranslateSuggest={async () => "Benefits"} onTranslateAccept={onTranslateAccept} />}
            >
                <Input name="title" value="Vorteile" onChange={vi.fn()} />
            </Field>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Translate" }));
        const translation = await screen.findByRole("group", { name: "Translation" });
        expect(translation).toHaveTextContent("Benefits");

        await userEvent.click(screen.getByRole("button", { name: "Accept" }));
        expect(onTranslateAccept).toHaveBeenCalledWith("Benefits");
        expect(screen.queryByRole("group", { name: "Translation" })).not.toBeInTheDocument();
    });
});
