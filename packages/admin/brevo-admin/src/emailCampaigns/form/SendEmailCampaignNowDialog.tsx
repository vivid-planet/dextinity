import { CancelButton, Dialog, SaveButton } from "@dextinity/admin";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FormattedMessage } from "react-intl";

interface SendEmailCampaignNowDialogProps {
    dialogOpen: boolean;
    handleNoClick: () => void;
    handleYesClick: () => void;
}

const SendEmailCampaignNowDialog = ({ dialogOpen, handleNoClick, handleYesClick }: SendEmailCampaignNowDialogProps) => {
    return (
        <Dialog open={dialogOpen} onClose={handleNoClick}>
            <DialogTitle>
                <FormattedMessage id="dextinity.emailCampaigns.sendNow.dialog.title" defaultMessage="Send email campaign now?" />
            </DialogTitle>
            <DialogContent>
                <FormattedMessage
                    id="dextinity.emailCampaigns.sendNow.dialog.contentText"
                    defaultMessage="Are you sure you want to send the email campaign now?"
                />
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleNoClick} />
                <SaveButton onClick={handleYesClick}>
                    <FormattedMessage id="dextinity.emailCampaigns.sendNow.dialog.sendText" defaultMessage="Send now" />
                </SaveButton>
            </DialogActions>
        </Dialog>
    );
};

export { SendEmailCampaignNowDialog };
