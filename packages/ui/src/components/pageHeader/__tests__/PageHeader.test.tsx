import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageHeader } from "../PageHeader";

afterEach(cleanup);

describe("PageHeader", () => {
    it("renders the title as the page heading with the contract classes", () => {
        const { container } = render(
            <PageHeader
                title="Page tree"
                eyebrow="Austria · German"
                subtitle="3 unpublished"
                primaryAction={{ label: "New page" }}
                back={{ label: "Overview", href: "/" }}
                className="consumer-class"
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe("HEADER");
        expect(root.className).toContain("dextinityPageHeader");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.hasBack).toBe("");
        expect(root.dataset.hasActions).toBe("");
        const heading = screen.getByRole("heading", { level: 1, name: "Page tree" });
        expect(heading.className).toContain("dextinityPageHeader__title");
        const back = screen.getByRole("link", { name: "Overview" });
        expect(back.getAttribute("href")).toBe("/");
        expect(back.parentElement?.className).toContain("dextinityPageHeader__labelLine");
        expect(screen.getByText("3 unpublished").className).toContain("dextinityPageHeader__subtitle");
        expect(container.querySelector(".dextinityPageHeader__labelLine")?.textContent).toBe("Austria · German");
    });

    it("leaves out the label line and the actions when they are not given", () => {
        const { container } = render(<PageHeader title="Page tree" />);

        expect(container.querySelector(".dextinityPageHeader__labelLine")).toBeNull();
        expect(container.querySelector(".dextinityPageHeader__actions")).toBeNull();
        expect((container.firstElementChild as HTMLElement).hasAttribute("data-has-back")).toBe(false);
    });

    it("shows a back button in the label line that calls onClick", () => {
        const onClick = vi.fn();
        render(<PageHeader title="Frontend developer" back={{ label: "Back to job ads", onClick }} primaryAction={{ label: "Save" }} />);

        const back = screen.getByRole("button", { name: "Back to job ads" });
        expect(back.closest(".dextinityPageHeader__labelLine")).not.toBeNull();
        fireEvent.click(back);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("emits the variant", () => {
        const { container } = render(
            <>
                <PageHeader title="Page tree" />
                <PageHeader title="Open positions" variant="compact" />
            </>,
        );

        expect(Array.from(container.children).map((header) => (header as HTMLElement).dataset.variant)).toStrictEqual(["default", "compact"]);
    });

    it("shows the primary and one secondary action as buttons", () => {
        const onSave = vi.fn();
        const onDownload = vi.fn();
        render(
            <PageHeader
                title="Photo"
                primaryAction={{ label: "Save", onClick: onSave }}
                secondaryActions={[{ label: "Download", onClick: onDownload }]}
            />,
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons.map((button) => button.textContent)).toStrictEqual(["Download", "Save"]);
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        expect(onDownload).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("puts more than one secondary action into a menu, so that it shows at most two buttons", () => {
        render(
            <PageHeader
                title="Photo"
                primaryAction={{ label: "Save" }}
                secondaryActions={[{ label: "Download" }, { label: "Archive" }, { label: "Delete", color: "error" }]}
                labels={{ moreActions: "Actions" }}
            />,
        );

        expect(screen.getAllByRole("button").map((button) => button.textContent)).toStrictEqual(["Actions", "Save"]);
        expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
    });

    it("makes the title editable in place with onTitleChange", () => {
        function EditableHeader() {
            const [title, setTitle] = useState("photo.jpg");
            return <PageHeader title={title} onTitleChange={setTitle} labels={{ titleInput: "File name" }} />;
        }
        const { container } = render(<EditableHeader />);

        const input = screen.getByRole("textbox", { name: "File name" });
        expect(screen.getByRole("heading", { level: 1 }).contains(input)).toBe(true);
        expect(input.className).toContain("dextinityPageHeader__titleInput");
        fireEvent.change(input, { target: { value: "offsite.jpg" } });
        expect(input).toHaveProperty("value", "offsite.jpg");
        expect((container.firstElementChild as HTMLElement).dataset.titleEditable).toBe("");
    });

    it("shows the status before the subtitle", () => {
        render(<PageHeader title="Careers" status={<span>Published</span>} subtitle="/careers" />);

        expect(screen.getByText("Published").closest(".dextinityPageHeader__subtitle")?.textContent).toBe("Published/careers");
    });

    it("leaves out a status that renders nothing", () => {
        const { container } = render(<PageHeader title="Photo" status={false} subtitle="2.4 MB" />);

        expect(container.querySelector(".dextinityPageHeader__subtitle")?.children).toHaveLength(0);
    });

    it("opens the submenu of a lone secondary action from its button", () => {
        render(<PageHeader title="Photo" secondaryActions={[{ label: "Move to", submenu: <span>Photos</span> }]} />);

        expect(screen.getByRole("button", { name: "Move to" }).getAttribute("aria-haspopup")).toBe("menu");
    });
});
