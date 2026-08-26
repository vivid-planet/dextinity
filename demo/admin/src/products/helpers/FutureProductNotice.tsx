import { Alert } from "@dextinity/admin";
import { useField } from "react-final-form";
import { FormattedMessage } from "react-intl";

export const FutureProductNotice = () => {
    const availableSinceField = useField("availableSince");
    const dateValue = availableSinceField.input.value ? new Date(availableSinceField.input.value) : null;
    const today = new Date();
    const willBeAvailableInTheFuture = dateValue && dateValue > today;

    if (willBeAvailableInTheFuture) {
        return (
            <Alert
                severity="warning"
                sx={{ mb: 4 }}
                title={
                    <FormattedMessage
                        id="product.futureProductNotice"
                        defaultMessage="This product will not be visible to the public until the selected date."
                    />
                }
            />
        );
    }

    return null;
};
