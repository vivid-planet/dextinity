import { Dialog, KeyValueList, type KeyValueListItem, Link, Typography } from "@dextinity/ui";
import type { ReactNode } from "react";
import { FormattedDate, useIntl } from "react-intl";

import { version } from "..";
import { useBuildInformation } from "../common/header/about/build-information/useBuildInformation";
import { AppFrameAboutDialogContent, AppFrameAboutDialogLogo } from "./AppFrameAboutDialog.sc";

interface AppFrameAboutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    logo?: ReactNode;
}

export function AppFrameAboutDialog({ open, onOpenChange, logo }: AppFrameAboutDialogProps) {
    const intl = useIntl();
    const buildInformation = useBuildInformation();

    const items: KeyValueListItem[] = [
        { key: intl.formatMessage({ id: "dextinity.about.dialog.version", defaultMessage: "Version" }), value: `v${version}` },
    ];
    if (buildInformation?.number) {
        items.push({
            key: intl.formatMessage({ id: "dextinity.about.dialog.buildNumber", defaultMessage: "Build" }),
            value: buildInformation.number,
        });
    }
    if (buildInformation?.commitHash) {
        items.push({
            key: intl.formatMessage({ id: "dextinity.about.dialog.commit", defaultMessage: "Commit" }),
            value: <code>{buildInformation.commitHash}</code>,
        });
    }
    if (buildInformation?.date) {
        items.push({
            key: intl.formatMessage({ id: "dextinity.about.dialog.buildDate", defaultMessage: "Built" }),
            value: <FormattedDate value={buildInformation.date} dateStyle="medium" timeStyle="short" />,
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            size="small"
            title={intl.formatMessage({ id: "dextinity.about.dialog.title", defaultMessage: "About" })}
            labels={{ close: intl.formatMessage({ id: "dextinity.about.dialog.close", defaultMessage: "Close" }) }}
        >
            <AppFrameAboutDialogContent>
                {logo != null && <AppFrameAboutDialogLogo>{logo}</AppFrameAboutDialogLogo>}
                <KeyValueList items={items} />
                <Typography variant="small">
                    {intl.formatMessage({ id: "dextinity.about.dialog.copyright", defaultMessage: "Copyright © Vivid Planet Software GmbH" })}
                </Typography>
                {/* eslint-disable-next-line react/jsx-no-literals */}
                <Link href="https://www.vivid-planet.com" external>
                    www.vivid-planet.com
                </Link>
            </AppFrameAboutDialogContent>
        </Dialog>
    );
}
