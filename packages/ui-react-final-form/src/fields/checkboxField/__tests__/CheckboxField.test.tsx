import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../../../focusOnError/focusOnError";
import { CheckboxField, isCheckboxChecked, toggleCheckboxValue } from "../CheckboxField";

describe("CheckboxField", () => {
    it("maps a boolean field to checked", () => {
        expect(isCheckboxChecked(true, undefined)).toBe(true);
        expect(isCheckboxChecked(undefined, undefined)).toBe(false);
        expect(isCheckboxChecked("", undefined)).toBe(false);
        expect(toggleCheckboxValue(false, undefined, true)).toBe(true);
    });

    it("adds and removes its value in a list field", () => {
        expect(isCheckboxChecked(["news"], "news")).toBe(true);
        expect(isCheckboxChecked(["blog"], "news")).toBe(false);
        expect(toggleCheckboxValue(undefined, "news", true)).toEqual(["news"]);
        expect(toggleCheckboxValue(["blog", "news"], "news", false)).toEqual(["blog"]);
    });

    it("requires a required checkbox to be checked", async () => {
        const onSubmit = vi.fn();
        render(
            <Form onSubmit={onSubmit}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <CheckboxField name="terms" required requiredMessage="Accept the terms to continue">
                            I accept the terms
                        </CheckboxField>
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        const checkbox = screen.getByRole("checkbox", { name: "I accept the terms" });
        expect(checkbox).toBeRequired();
        expect(checkbox).toBeInvalid();
        expect(checkbox).toHaveAccessibleDescription("Accept the terms to continue");
        expect(onSubmit).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("checkbox"));
        expect(screen.queryByText("Accept the terms to continue")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ terms: true }, expect.anything(), expect.anything());
    });

    it("focuses the first box of an invalid group", async () => {
        render(
            <Form onSubmit={vi.fn()} decorators={[focusOnError]}>
                {({ handleSubmit, values }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <CheckboxField name="channels" value="news" required>
                            News
                        </CheckboxField>
                        {!values.hideBlog && (
                            <CheckboxField name="channels" value="blog" required>
                                Blog
                            </CheckboxField>
                        )}
                        <CheckboxField name="hideBlog">Hide blog</CheckboxField>
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(screen.getByRole("checkbox", { name: "News" })).toHaveFocus();

        await userEvent.click(screen.getByRole("checkbox", { name: "Hide blog" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(screen.getByRole("checkbox", { name: "News" })).toHaveFocus();
    });
});
