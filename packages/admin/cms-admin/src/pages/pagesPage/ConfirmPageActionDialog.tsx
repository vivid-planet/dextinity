import { CancelButton, OkayButton } from "@dextinity/admin";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import type { ComponentType } from "react";
import { FormattedMessage } from "react-intl";

import type { PageAction } from "./PagesPageActionToolbar";

interface ContentProps {
    selectedPagesCount: number;
}

type PageActionMessages = {
    [key in PageAction]: {
        title: ComponentType;
        content: ComponentType<ContentProps>;
    };
};

const Messages: PageActionMessages = {
    publish: {
        title: () => <FormattedMessage id="dextinity.pages.confirmDialog.publish.title" defaultMessage="Publish selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="dextinity.pages.confirmDialog.publish.content"
                defaultMessage="Are you sure that you want to publish {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
    unpublish: {
        title: () => <FormattedMessage id="dextinity.pages.confirmDialog.unpublish.title" defaultMessage="Unpublish selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="dextinity.pages.confirmDialog.unpublish.content"
                defaultMessage="Are you sure that you want to unpublish {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
    archive: {
        title: () => <FormattedMessage id="dextinity.pages.confirmDialog.archive.title" defaultMessage="Archive selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="dextinity.pages.confirmDialog.archive.content"
                defaultMessage="Are you sure that you want to archive {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
};

interface ConfirmPageActionDialogProps {
    open: boolean;
    onCloseDialog: (confirmed: boolean) => void;
    action?: PageAction;
    selectedPagesCount: number;
}

export const ConfirmPageActionDialog = ({ open, onCloseDialog, action, selectedPagesCount }: ConfirmPageActionDialogProps) => {
    const Title = action ? Messages[action].title : undefined;
    const Content = action ? Messages[action].content : undefined;

    return (
        <Dialog open={open} onClose={() => onCloseDialog(false)}>
            <DialogTitle>{Title && <Title />}</DialogTitle>
            <DialogContent>
                <DialogContentText>{Content && <Content selectedPagesCount={selectedPagesCount} />}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={() => onCloseDialog(false)} />
                <OkayButton
                    onClick={() => {
                        onCloseDialog(true);
                    }}
                    autoFocus={true}
                >
                    <FormattedMessage id="dextinity.pages.confirmDialog.confirm" defaultMessage="Confirm" />
                </OkayButton>
            </DialogActions>
        </Dialog>
    );
};
