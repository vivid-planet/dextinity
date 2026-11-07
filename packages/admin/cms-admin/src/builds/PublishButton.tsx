import { Button, type ButtonProps, Icon } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import { StartBuildsDialog } from "./StartBuildsDialog";

export function PublishButton(props: Omit<ButtonProps, "onClick" | "children">) {
    const intl = useIntl();
    const [isStartBuildsDialogOpen, setIsStartBuildsDialogOpen] = useState(false);

    return (
        <>
            <Button
                startIcon={<Icon name="play" />}
                disabled={process.env.NODE_ENV === "development"}
                {...props}
                onClick={() => setIsStartBuildsDialogOpen(true)}
            >
                {intl.formatMessage({ id: "dextinity.pages.publisher.build", defaultMessage: "Start builds" })}
            </Button>
            <StartBuildsDialog open={isStartBuildsDialogOpen} onClose={() => setIsStartBuildsDialogOpen(false)} />
        </>
    );
}
