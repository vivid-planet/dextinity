import { messages } from "@dextinity/admin";
import { Domain } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Button,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { ExternalLinkBlockData } from "../../blocks.generated";

interface OpenLinkDialogProps {
    onClose?: () => void;
    open: boolean;
    link?: ExternalLinkBlockData;
}

const IconContainer = styled("div")`
    margin-right: 10px;
`;
function OpenLinkDialog({ open, onClose, link }: OpenLinkDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}>
            <DialogTitle>
                <Grid container>
                    <Grid>
                        <IconContainer>
                            <Domain />
                        </IconContainer>
                    </Grid>
                    <Grid>
                        <Typography>
                            <FormattedMessage id="dextinity.preview.openLink.title" defaultMessage="Open Link" />
                        </Typography>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    <FormattedMessage
                        id="dextinity.preview.openExternalLink.description"
                        defaultMessage='Do you want to open "{url}" in a new Browser tab?'
                        values={{
                            url: link?.targetUrl,
                        }}
                    />
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="info">
                    <FormattedMessage {...messages.cancel} />
                </Button>

                <Button
                    onClick={() => {
                        onClose?.();
                        window.open(link?.targetUrl);
                    }}
                    variant="contained"
                    color="primary"
                >
                    <FormattedMessage id="dextinity.openLinkDialog.actionButtons.open" defaultMessage="Open" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export { OpenLinkDialog };
