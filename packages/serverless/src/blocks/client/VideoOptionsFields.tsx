import { OnChangeField, SwitchField } from "@dextinity/admin";
import { useForm } from "react-final-form";
import { FormattedMessage } from "react-intl";

/** Like the video options of `@dextinity/cms-admin`, which aren't exported: a video needs autoplay or controls, or it can't be played */
export function VideoOptionsFields() {
    const form = useForm();
    return (
        <>
            <SwitchField name="autoplay" label={<FormattedMessage id="dextinity.blocks.video.autoplay" defaultMessage="Autoplay" />} />
            <SwitchField name="loop" label={<FormattedMessage id="dextinity.blocks.video.loop" defaultMessage="Loop" />} />
            <SwitchField name="showControls" label={<FormattedMessage id="dextinity.blocks.video.showControls" defaultMessage="Show controls" />} />
            <OnChangeField name="autoplay">
                {(value, previousValue) => {
                    if (!value && previousValue) {
                        form.change("showControls", true);
                    }
                }}
            </OnChangeField>
            <OnChangeField name="showControls">
                {(value, previousValue) => {
                    if (!value && previousValue) {
                        form.change("autoplay", true);
                    }
                }}
            </OnChangeField>
        </>
    );
}
