import { SaveState } from "@dextinity/ui";
import { useFormSaveState } from "@dextinity/ui-react-final-form";
import { useIntl } from "react-intl";

export function BrevoFormSaveState() {
    const intl = useIntl();
    return (
        <SaveState
            {...useFormSaveState()}
            locale={intl.locale}
            labels={{
                saved: intl.formatMessage({ id: "dextinity.brevo.saveState.saved", defaultMessage: "All changes saved" }),
                dirty: intl.formatMessage({ id: "dextinity.brevo.saveState.dirty", defaultMessage: "Unsaved changes" }),
                saving: intl.formatMessage({ id: "dextinity.brevo.saveState.saving", defaultMessage: "Saving …" }),
                error: intl.formatMessage({ id: "dextinity.brevo.saveState.error", defaultMessage: "Not saved" }),
                savedAt: intl.formatMessage({ id: "dextinity.brevo.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
            }}
        />
    );
}
