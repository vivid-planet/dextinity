import { SendingState } from "./sending-state.enum";

// Must exceed the longest expected background send (ECG RTR list check for all contacts plus the Brevo send call),
// as a campaign marked as failed can be re-sent as a new Brevo campaign
export const INTERRUPTED_SEND_TIMEOUT_MS = 60 * 60 * 1000;

export function getScheduledCampaignSendingState({
    scheduledAt,
    brevoSendingState,
    now = new Date(),
}: {
    scheduledAt: Date;
    brevoSendingState: SendingState | undefined;
    now?: Date;
}): SendingState {
    if (brevoSendingState) {
        return brevoSendingState;
    }

    // No Brevo campaign or still a Brevo draft long after the scheduled time means the background send was interrupted, e.g., by an API restart
    if (now.getTime() - scheduledAt.getTime() > INTERRUPTED_SEND_TIMEOUT_MS) {
        return SendingState.FAILED;
    }

    return SendingState.SCHEDULED;
}
