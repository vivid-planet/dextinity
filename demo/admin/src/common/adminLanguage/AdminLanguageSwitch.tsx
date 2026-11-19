import { Check } from "@dextinity/admin-icons";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { useId } from "react";
import { FormattedMessage } from "react-intl";

interface AdminLanguageSwitchProps<Language extends string> {
    languages: readonly Language[];
    value: Language;
    onChange: (language: Language) => void;
}

export function AdminLanguageSwitch<Language extends string>({ languages, value, onChange }: AdminLanguageSwitchProps<Language>) {
    const labelId = useId();

    return (
        <>
            <Label id={labelId} variant="caption">
                <FormattedMessage id="adminLanguageSwitch.label" defaultMessage="Admin language" />
            </Label>
            <LanguageList role="group" aria-labelledby={labelId} dense disablePadding>
                {languages.map((language) => {
                    const isSelected = language === value;
                    return (
                        <LanguageListItemButton key={language} aria-pressed={isSelected} selected={isSelected} onClick={() => onChange(language)}>
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
