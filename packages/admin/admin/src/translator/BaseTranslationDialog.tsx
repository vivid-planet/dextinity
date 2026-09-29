import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { type JSX, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { messages } from "../messages";

interface TranslationDialogBaseProps<T> {
    open: boolean;
    onClose: () => void;
    originalText: T;
    translatedText: T;
    onApplyTranslation: (value: T) => void;
    renderOriginalText: (text: T) => JSX.Element;
    renderTranslatedText: (text: T, onChange: (value: T) => void) => JSX.Element;
}

export const BaseTranslationDialog = <T,>(props: TranslationDialogBaseProps<T>) => {
    const { open, onClose, originalText, translatedText, onApplyTranslation, renderOriginalText, renderTranslatedText } = props;
    const [translation, setTranslation] = useState(translatedText);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <FormattedMessage id="dextinity.translator.translation" defaultMessage="Translation" />
            </DialogTitle>
            <DialogContent>
                <Grid container columnSpacing={4} rowSpacing={2} columns={2} alignItems="center">
                    <Grid size={1}>
                        <Typography variant="subtitle2">
                            <FormattedMessage id="dextinity.translator.original" defaultMessage="Original" />
                        </Typography>
                    </Grid>
                    <Grid size={1}>
                        <Typography variant="subtitle2">
                            <FormattedMessage id="dextinity.translator.translation" defaultMessage="Translation" />
                        </Typography>
                    </Grid>
                    <Grid size={1}>{renderOriginalText(originalText)}</Grid>
                    <Grid size={1}>{renderTranslatedText(translation, setTranslation)}</Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="textDark" onClick={onClose}>
                    <FormattedMessage {...messages.cancel} />
                </Button>
                <Button
                    onClick={() => {
                        onApplyTranslation(translation);
                        onClose();
                    }}
                >
                    <FormattedMessage {...messages.apply} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
