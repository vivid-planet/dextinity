import { FieldContainer, MainContent, MasterLayout } from "@dextinity/admin";
import { Check, ChevronRight, Language } from "@dextinity/admin-icons";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Header } from "../Header";
import { UserHeaderItem } from "../UserHeaderItem";

const EmptyMenu = () => null;

const renderInMasterLayout: Decorator = (Story) => (
    <MasterLayout headerComponent={Story} menuComponent={EmptyMenu}>
        <MainContent>
            <Typography>Page content</Typography>
        </MainContent>
    </MasterLayout>
);

const config: Meta = {
    title: "common/header/LanguageSwitchProposals",
    decorators: [renderInMasterLayout],
};

export default config;

type Story = StoryObj;

const languageNames: Record<string, string> = { de: "Deutsch", en: "English", fr: "Français", it: "Italiano", es: "Español" };

function SectionLabel() {
    return (
        <Typography variant="caption" component="div" color="grey.400" mb={2}>
            Admin language
        </Typography>
    );
}

function ToggleVariant({ languages }: { languages: string[] }) {
    const [value, setValue] = useState("de");
    return (
        <>
            <SectionLabel />
            <ToggleButtonGroup exclusive fullWidth value={value} onChange={(_, v) => v && setValue(v)}>
                {languages.map((language) => (
                    <ToggleButton key={language} value={language}>
                        {language.toUpperCase()}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </>
    );
}

function SelectVariant({ languages }: { languages: string[] }) {
    const [value, setValue] = useState("de");
    return (
        <FieldContainer label="Admin language" fullWidth>
            <Select fullWidth value={value} onChange={(event) => setValue(event.target.value)} startAdornment={<Language sx={{ mr: 1 }} />}>
                {languages.map((language) => (
                    <MenuItem key={language} value={language}>
                        {languageNames[language]}
                    </MenuItem>
                ))}
            </Select>
        </FieldContainer>
    );
}

function ListVariant({ languages }: { languages: string[] }) {
    const [value, setValue] = useState("de");
    return (
        <>
            <SectionLabel />
            <Box mx={-4}>
                <List dense disablePadding>
                    {languages.map((language) => (
                        <ListItemButton key={language} selected={language === value} onClick={() => setValue(language)}>
                            <ListItemIcon>{language === value ? <Check color="primary" /> : null}</ListItemIcon>
                            <ListItemText primary={languageNames[language]} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </>
    );
}

function SubmenuRowVariant() {
    return (
        <Box mx={-4} my={-2}>
            <ListItemButton>
                <ListItemIcon>
                    <Language />
                </ListItemIcon>
                <ListItemText primary="Language" />
                <Typography variant="body2" color="grey.400" mr={1}>
                    Deutsch
                </Typography>
                <ChevronRight />
            </ListItemButton>
        </Box>
    );
}

const twoLanguages = ["de", "en"];
const manyLanguages = ["de", "en", "fr", "it", "es"];

export const A_ToggleButtons: Story = {
    render: () => (
        <Header>
            <UserHeaderItem>
                <ToggleVariant languages={twoLanguages} />
            </UserHeaderItem>
        </Header>
    ),
};

export const B_Select: Story = {
    render: () => (
        <Header>
            <UserHeaderItem>
                <SelectVariant languages={manyLanguages} />
            </UserHeaderItem>
        </Header>
    ),
};

export const C_List: Story = {
    render: () => (
        <Header>
            <UserHeaderItem>
                <ListVariant languages={twoLanguages} />
            </UserHeaderItem>
        </Header>
    ),
};

export const D_SubmenuRow: Story = {
    render: () => (
        <Header>
            <UserHeaderItem>
                <SubmenuRowVariant />
            </UserHeaderItem>
        </Header>
    ),
};

export const E_SingleLanguageHidden: Story = {
    render: () => (
        <Header>
            <UserHeaderItem />
        </Header>
    ),
};

export const F_SingleLanguageReadOnly: Story = {
    render: () => (
        <Header>
            <UserHeaderItem>
                <SectionLabel />
                <Box display="flex" alignItems="center" gap={2}>
                    <Language />
                    <Typography variant="body2">Deutsch</Typography>
                </Box>
            </UserHeaderItem>
        </Header>
    ),
};
