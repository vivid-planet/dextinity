import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DevicePreview } from "./DevicePreview";

afterEach(cleanup);

describe("DevicePreview", () => {
    it("emits the device as a data attribute and lays the content out at the device's width", () => {
        const { container } = render(
            <DevicePreview url="example.com" device="tablet" onDeviceChange={vi.fn()} deviceWidths={{ tablet: 800 }}>
                <p>Page</p>
            </DevicePreview>,
        );
        const root = container.firstElementChild as HTMLElement;

        expect(root.className).toContain("dextinityDevicePreview");
        expect(root.dataset.device).toBe("tablet");
        expect(screen.getByText("Page").parentElement?.style.inlineSize).toBe("800px");
    });

    it("lays the content out at the available width for a device set to fill", () => {
        const { container } = render(
            <DevicePreview url="example.com" device="responsive" devices={["responsive", "desktop"]} onDeviceChange={vi.fn()}>
                <p>Page</p>
            </DevicePreview>,
        );
        const root = container.firstElementChild as HTMLElement;

        expect(root.dataset.fill).toBe("");
        expect(screen.getByText("Page").parentElement?.style.inlineSize).toBe("100%");
        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(["Full width", "Desktop"]);
    });

    it("shows the page from src in an iframe and marks the frame as loading until it has loaded", () => {
        const { container } = render(
            <DevicePreview url="example.com" device="desktop" onDeviceChange={vi.fn()} src="https://example.com/" overlay={<span>Outline</span>} />,
        );
        const root = container.firstElementChild as HTMLElement;
        const iframe = screen.getByTitle("Page preview");

        expect(root.dataset.iframe).toBe("");
        expect(root.dataset.loading).toBe("");
        expect(screen.getByRole("progressbar", { name: "Loading preview" })).toBeTruthy();
        expect(screen.getByText("Outline").parentElement?.className).toContain("dextinityDevicePreview__overlay");

        fireEvent.load(iframe);

        expect(root.dataset.loading).toBeUndefined();
        expect(screen.queryByRole("progressbar")).toBeNull();
    });

    it("keeps showing the loading state while loading is set", () => {
        const { container } = render(
            <DevicePreview url="example.com" device="desktop" onDeviceChange={vi.fn()} src="https://example.com/" loading />,
        );
        fireEvent.load(screen.getByTitle("Page preview"));

        expect((container.firstElementChild as HTMLElement).dataset.loading).toBe("");
    });
});
