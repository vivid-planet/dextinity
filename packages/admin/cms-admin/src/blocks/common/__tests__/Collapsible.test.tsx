import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { Collapsible } from "../Collapsible";
import { CollapsibleSwitchButtonHeader } from "../CollapsibleSwitchButtonHeader";

function OptionalSection() {
    const [open, setOpen] = useState(false);
    return (
        <Collapsible open={open} onChange={setOpen} header={<CollapsibleSwitchButtonHeader checked={open} title="Page index" />}>
            Sitemap options
        </Collapsible>
    );
}

describe("Collapsible", () => {
    afterEach(() => {
        cleanup();
    });

    it("shows the content while the switch in the header is on", () => {
        render(<OptionalSection />);

        expect(screen.queryByText("Sitemap options")).toBeNull();

        fireEvent.click(screen.getByRole("switch", { name: "Page index" }));

        expect(screen.getByRole("switch", { name: "Page index" }).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByText("Sitemap options")).toBeTruthy();
    });
});
