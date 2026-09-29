import { OnChangeField, SwitchField } from "@dextinity/admin";
import { useForm } from "react-final-form";
import { FormattedMessage } from "react-intl";

export const VideoOptionsFields = () => {
    const form = useForm();
    return (
        <>
            <SwitchField name="autoplay" label={<FormattedMessage id="dextinity.blocks.video.autoplay" defaultMessage="Autoplay" />} />
            <SwitchField name="loop" label={<FormattedMessage id="dextinity.blocks.video.loop" defaultMessage="Loop" />} />
            <SwitchField name="showControls" label={<FormattedMessage id="dextinity.blocks.video.showControls" defaultMessage="Show controls" />} />
            {/* case: autoplay = false and showControls = false is not allowed */}
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
};
