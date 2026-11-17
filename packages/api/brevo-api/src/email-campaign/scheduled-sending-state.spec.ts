import { describe, expect, it } from "vitest";

import { getScheduledCampaignSendingState, INTERRUPTED_SEND_TIMEOUT_MS } from "./scheduled-sending-state.js";
import { SendingState } from "./sending-state.enum.js";

describe("getScheduledCampaignSendingState", () => {
    const now = new Date("2026-11-09T12:00:00Z");
    const beforeTimeout = new Date(now.getTime() - INTERRUPTED_SEND_TIMEOUT_MS + 1000);
    const afterTimeout = new Date(now.getTime() - INTERRUPTED_SEND_TIMEOUT_MS - 1000);

    it("uses the Brevo sending state if Brevo reports one", () => {
        expect(getScheduledCampaignSendingState({ scheduledAt: afterTimeout, brevoSendingState: SendingState.SENT, now })).toBe(SendingState.SENT);
        expect(getScheduledCampaignSendingState({ scheduledAt: afterTimeout, brevoSendingState: SendingState.SCHEDULED, now })).toBe(
            SendingState.SCHEDULED,
        );
        expect(getScheduledCampaignSendingState({ scheduledAt: afterTimeout, brevoSendingState: SendingState.DRAFT, now })).toBe(SendingState.DRAFT);
    });

    it("keeps the campaign scheduled while the background send may still be running", () => {
        expect(getScheduledCampaignSendingState({ scheduledAt: beforeTimeout, brevoSendingState: undefined, now })).toBe(SendingState.SCHEDULED);
    });

    it("marks the campaign as failed if the send was interrupted", () => {
        expect(getScheduledCampaignSendingState({ scheduledAt: afterTimeout, brevoSendingState: undefined, now })).toBe(SendingState.FAILED);
    });
});
