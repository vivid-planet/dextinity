import { cleanup, render, screen } from "@testing-library/react";
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
});
