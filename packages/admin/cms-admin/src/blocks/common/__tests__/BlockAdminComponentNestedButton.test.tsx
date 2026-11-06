import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { BlockAdminComponentNestedButton } from "../BlockAdminComponentNestedButton";

describe("BlockAdminComponentNestedButton", () => {
    afterEach(() => {
        cleanup();
    });

    it("names the invalid state for assistive technology", async () => {
        render(<BlockAdminComponentNestedButton displayName="Teaser" preview="Two items" isValid={() => false} />);

        expect(await screen.findByRole("button", { name: /Contains errors/ })).toBeTruthy();
    });

    it("has no error marker while valid", () => {
        render(<BlockAdminComponentNestedButton displayName="Teaser" preview="Two items" isValid={() => true} />);

        expect(screen.queryByLabelText("Contains errors")).toBeNull();
    });
});
