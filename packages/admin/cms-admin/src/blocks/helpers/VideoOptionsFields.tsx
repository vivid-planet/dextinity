import { OnChangeField } from "@dextinity/admin";
import { SwitchField } from "@dextinity/ui-react-final-form";
import { useForm } from "react-final-form";
import { FormattedMessage } from "react-intl";

export const VideoOptionsFields = () => {
    const form = useForm();
    return (
        <>
            <SwitchField name="autoplay">
                <FormattedMessage id="dextinity.blocks.video.autoplay" defaultMessage="Autoplay" />
            </SwitchField>
            <SwitchField name="loop">
                <FormattedMessage id="dextinity.blocks.video.loop" defaultMessage="Loop" />
            </SwitchField>
            <SwitchField name="showControls">
                <FormattedMessage id="dextinity.blocks.video.showControls" defaultMessage="Show controls" />
            </SwitchField>
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
