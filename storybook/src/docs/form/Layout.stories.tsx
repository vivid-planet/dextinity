import {
    Button,
    CancelButton,
    CheckboxField,
    createDextinityTheme,
    Field,
    FieldContainer,
    FinalFormInput,
    FinalFormRadio,
    FinalFormSelect,
    FormSection,
    OkayButton,
} from "@dextinity/admin";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    MenuItem,
    Paper,
    ThemeProvider,
    Typography,
} from "@mui/material";
import { styled, StyledEngineProvider } from "@mui/material/styles";
import { useState } from "react";
import { Form } from "react-final-form";

const fooBarOptions = [
    { value: "foo", label: "Foo" },
    { value: "bar", label: "Bar" },
];

const flavourOptions = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];

export default {
    title: "Docs/Form/Layout",
};

export const FieldsInSidebar = {
    render: () => {
        const Root = styled("div")`
            display: flex;
            align-items: stretch;
            justify-content: stretch;
        `;

        const Content = styled(Paper)`
            flex-grow: 1;
            margin-right: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const ContentText = styled(Typography)`
            font-size: 54px;
            opacity: 0.25;
        `;

        const Sidebar = styled("div")`
            max-width: 350px;
            flex-grow: 1;
        `;

        return (
            <Root>
                <Content>
                    <ContentText>Content</ContentText>
                </Content>
                <Sidebar>
                    <Form
                        onSubmit={() => {}}
                        render={({ handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <FormSection title="First section">
                                    <Field name="text1" label="Text 1" fullWidth component={FinalFormInput} />
                                    <Field name="select" label="Select" fullWidth>
                                        {(props) => (
                                            <FinalFormSelect {...props}>
                                                {flavourOptions.map((option) => (
                                                    <MenuItem value={option.value} key={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </FinalFormSelect>
                                        )}
                                    </Field>
                                </FormSection>
                                <FormSection title="Second section">
                                    <Field name="text3" label="Text 3" fullWidth component={FinalFormInput} />
                                    <Field
                                        name="textMultiline"
                                        label="Text (multiline)"
                                        multiline
                                        minRows={3}
                                        maxRows={5}
                                        fullWidth
                                        component={FinalFormInput}
                                    />
                                    <CheckboxField name="checkbox" label="Checkbox" fullWidth />
                                    <FieldContainer label="Radio" fullWidth>
                                        <>
                                            {flavourOptions.map(({ value, label }) => (
                                                <Field key={value} name="radio" type="radio" value={value} variant="vertical">
                                                    {(props) => <FormControlLabel label={label} control={<FinalFormRadio {...props} />} />}
                                                </Field>
                                            ))}
                                        </>
                                    </FieldContainer>
                                </FormSection>
                            </form>
                        )}
                    />
                </Sidebar>
            </Root>
        );
    },

    name: "Fields in sidebar",
};

export const FieldsInDialog = {
    render: () => {
        const [showDialog, setShowDialog] = useState<boolean>(false);

        return (
            <>
                <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                    <Form
                        onSubmit={() => {
                            setShowDialog(false);
                        }}
                        render={({ handleSubmit }) => (
                            <>
                                <DialogTitle>Full-width fields inside a dialog</DialogTitle>
                                <DialogContent>
                                    <form onSubmit={handleSubmit}>
                                        <Field name="select" label="Select" fullWidth>
                                            {(props) => (
                                                <FinalFormSelect {...props} fullWidth>
                                                    {flavourOptions.map((option) => (
                                                        <MenuItem value={option.value} key={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </FinalFormSelect>
                                            )}
                                        </Field>
                                        <Field name="text" label="Text" fullWidth component={FinalFormInput} />
                                        <Field
                                            name="textMultiline"
                                            label="Text (multiline)"
                                            multiline
                                            minRows={3}
                                            maxRows={5}
                                            fullWidth
                                            component={FinalFormInput}
                                        />
                                        <CheckboxField name="checkbox" label="Checkbox" fullWidth />
                                    </form>
                                </DialogContent>
                                <DialogActions>
                                    <CancelButton onClick={() => setShowDialog(false)} />
                                    <OkayButton onClick={handleSubmit} />
                                </DialogActions>
                            </>
                        )}
                    />
                </Dialog>

                <div style={{ textAlign: "center" }}>
                    <Button onClick={() => setShowDialog(true)}>Show Dialog</Button>
                </div>
            </>
        );
    },

    name: "Fields in dialog",
};

export const InlineFields = {
    render: () => {
        return (
            <Form
                onSubmit={() => {}}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field name="select1" label="Select 1" width={400}>
                            {(props) => (
                                <FinalFormSelect {...props}>
                                    {fooBarOptions.map((option) => (
                                        <MenuItem value={option.value} key={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </FinalFormSelect>
                            )}
                        </Field>
                        <Field name="select2" label="Select 2">
                            {(props) => (
                                <FinalFormSelect {...props}>
                                    {flavourOptions.map((option) => (
                                        <MenuItem value={option.value} key={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </FinalFormSelect>
                            )}
                        </Field>
                        <Field name="text1" label="Text 1" component={FinalFormInput} />
                        <Field name="text2" label="Text 2" component={FinalFormInput} />
                    </form>
                )}
            />
        );
    },

    name: "Inline fields",
};

export const GridLayout = {
    render: () => {
        return (
            <Form
                onSubmit={() => {}}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            <Grid size={3}>
                                <Field name="select1" label="Select 1" fullWidth>
                                    {(props) => (
                                        <FinalFormSelect {...props}>
                                            {fooBarOptions.map((option) => (
                                                <MenuItem value={option.value} key={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </FinalFormSelect>
                                    )}
                                </Field>
                            </Grid>
                            <Grid size={3}>
                                <Field name="select2" label="Select 2" fullWidth>
                                    {(props) => (
                                        <FinalFormSelect {...props}>
                                            {flavourOptions.map((option) => (
                                                <MenuItem value={option.value} key={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </FinalFormSelect>
                                    )}
                                </Field>
                            </Grid>
                            <Grid size={3}>
                                <Field name="text1" label="Text 1" component={FinalFormInput} fullWidth />
                            </Grid>
                            <Grid size={3}>
                                <Field name="text2" label="Text 2" component={FinalFormInput} fullWidth />
                            </Grid>
                        </Grid>
                    </form>
                )}
            />
        );
    },

    name: "Grid layout",
};

export const HorizontalFields = {
    render: () => {
        const theme = createDextinityTheme({
            components: {
                DextinityAdminFormFieldContainer: {
                    defaultProps: {
                        variant: "horizontal",
                    },
                },
            },
        });

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Form
                        onSubmit={() => {}}
                        initialValues={{ select: "none" }}
                        render={({ handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Field name="select" label="Select">
                                    {(props) => (
                                        <FinalFormSelect {...props}>
                                            <MenuItem value="none">No value</MenuItem>
                                            {flavourOptions.map((option) => (
                                                <MenuItem value={option.value} key={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </FinalFormSelect>
                                    )}
                                </Field>
                                <Field name="text" label="Text" component={FinalFormInput} fullWidth />
                                <Field name="Multiline" label="Multiline" multiline minRows={3} maxRows={5} component={FinalFormInput} fullWidth />
                                <FieldContainer label="Radio" fullWidth>
                                    <>
                                        {flavourOptions.map(({ value, label }) => (
                                            <Field key={value} name="radio" type="radio" value={value} variant="vertical">
                                                {(props) => <FormControlLabel label={label} control={<FinalFormRadio {...props} />} />}
                                            </Field>
                                        ))}
                                    </>
                                </FieldContainer>
                                <CheckboxField name="checkbox" fieldLabel="Checkbox" fullWidth />
                            </form>
                        )}
                    />
                </ThemeProvider>
            </StyledEngineProvider>
        );
    },

    name: "Horizontal fields",
};
