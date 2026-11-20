import { Check } from "@dextinity/admin-icons";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { useId } from "react";
import { FormattedMessage } from "react-intl";

import type { AdminLanguageContextValue } from "./AdminLanguageProvider";

type AdminLanguageSwitchProps = AdminLanguageContextValue;

export function AdminLanguageSwitch({ language: selectedLanguage, supportedLanguages, setLanguage }: AdminLanguageSwitchProps) {
    const labelId = useId();

    return (
        <>
            <Label id={labelId} variant="caption">
                <FormattedMessage id="dextinity.adminLanguageSwitch.label" defaultMessage="Admin language" />
            </Label>
            <LanguageList role="group" aria-labelledby={labelId} dense disablePadding>
                {supportedLanguages.map((language) => {
                    const isSelected = language === selectedLanguage;
                    return (
                        <LanguageListItemButton key={language} aria-pressed={isSelected} selected={isSelected} onClick={() => setLanguage(language)}>
                            <ListItemText primary={getNativeLanguageName(language)} lang={language} />
                            {isSelected && <Check color="primary" />}
                        </LanguageListItemButton>
                    );
                })}
            </LanguageList>
        </>
    );
}

// Each language is named in itself, so users who switched to a language they can't read still find their own
function getNativeLanguageName(language: string): string {
    return new Intl.DisplayNames([language], { type: "language" }).of(language) ?? language;
}

const Label = styled(Typography)(
    ({ theme }) => css`
        display: block;
        padding-bottom: ${theme.spacing(2)};
        color: ${theme.palette.grey[400]};
    `,
);

// The negative margin lets the selected background span the full width of the padded section in UserHeaderItem
const LanguageList = styled(List)(
    ({ theme }) => css`
        margin-inline: ${theme.spacing(-4)};
    `,
);

const LanguageListItemButton = styled(ListItemButton)(
    ({ theme }) => css`
        padding-inline: ${theme.spacing(4)};
    `,
);
