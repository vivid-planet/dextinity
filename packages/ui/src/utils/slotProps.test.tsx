import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveSlotProps, type SlotPropsValue } from "./slotProps";

// Testing Library only registers its own cleanup when Vitest's globals are enabled, which they are not.
afterEach(cleanup);

type ProbeOwnerState = { variant: "primary" | "secondary" };

/**
 * A test-only component that renders the merged props the way a slot does, for
 * the behavior that is only observable on a real element.
 */
function SlotProbe({ ownProps, slotProps }: { ownProps: ComponentPropsWithRef<"span">; slotProps?: SlotPropsValue<ProbeOwnerState, "span"> }) {
    return <span {...resolveSlotProps<ProbeOwnerState, "span", "span">({ ownProps, slotProps, ownerState: { variant: "primary" } })}>probe</span>;
}

describe("resolveSlotProps", () => {
    it("keeps the own props when the consumer passes no value", () => {
        const merged = resolveSlotProps<ProbeOwnerState, "span", "span">({ ownProps: { className: "own" }, ownerState: { variant: "primary" } });

        expect(merged).toMatchObject({ className: "own" });
    });

    it("adds the consumer's class alongside the own class", () => {
        render(<SlotProbe ownProps={{ className: "own" }} slotProps={{ className: "consumer" }} />);

        expect(screen.getByText("probe")).toHaveClass("own", "consumer");
    });

    it("resolves a function value with the ownerState and merges its result", () => {
        const consumerValue: SlotPropsValue<ProbeOwnerState, "span"> = (ownerState) => ({ title: ownerState.variant });

        const merged = resolveSlotProps<ProbeOwnerState, "span", "span">({
            ownProps: { className: "own" },
            slotProps: consumerValue,
            ownerState: { variant: "secondary" },
        });

        expect(merged).toMatchObject({ className: "own", title: "secondary" });
    });

    it("runs the own and the consumer event handler", async () => {
        const handleOwnClick = vi.fn();
        const handleConsumerClick = vi.fn();

        render(<SlotProbe ownProps={{ onClick: handleOwnClick }} slotProps={{ onClick: handleConsumerClick }} />);
        await userEvent.click(screen.getByText("probe"));

        expect(handleOwnClick).toHaveBeenCalledOnce();
        expect(handleConsumerClick).toHaveBeenCalledOnce();
    });
});
