import { Form } from "react-final-form";
import { act, cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PageTreeSelectDialogProps, PageTreeSelectValue } from "../PageTreeSelectDialog";
import { PageTreeSelectField } from "../PageTreeSelectField";

const dialogProps = vi.hoisted(() => ({ current: undefined as PageTreeSelectDialogProps | undefined }));

vi.mock("../PageTreeSelectDialog", () => ({
    PageTreeSelectDialog: (props: PageTreeSelectDialogProps) => {
        dialogProps.current = props;
        return props.open ? <div role="dialog" aria-label="Pages" /> : null;
    },
}));

const about: PageTreeSelectValue = { id: "about", name: "About us", path: "/about", documentType: "Page" };
const contact: PageTreeSelectValue = { id: "contact", name: "Contact", path: "/contact", documentType: "Page" };

describe("PageTreeSelectField", () => {
    afterEach(() => {
        cleanup();
        dialogProps.current = undefined;
    });

    it("shows the chosen page and sets the page chosen in the dialog", () => {
        render(
            <Form onSubmit={vi.fn()} initialValues={{ targetPage: about }}>
                {() => <PageTreeSelectField name="targetPage" label="Target page" />}
            </Form>,
        );

        expect(screen.getByText("About us")).toBeTruthy();
        expect(screen.getByText("/about")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: /^Target page/ }));

        expect(screen.getByRole("dialog", { name: "Pages" })).toBeTruthy();
        expect(dialogProps.current?.value).toEqual(about);

        act(() => dialogProps.current?.onChange(contact));

        expect(screen.queryByRole("dialog", { name: "Pages" })).toBeNull();
        expect(screen.getByText("Contact")).toBeTruthy();
    });

    it("clears the page", () => {
        render(
            <Form onSubmit={vi.fn()} initialValues={{ targetPage: about }}>
                {() => <PageTreeSelectField name="targetPage" label="Target page" />}
            </Form>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Remove page" }));

        expect(screen.getByText("Select Page")).toBeTruthy();
    });
});
