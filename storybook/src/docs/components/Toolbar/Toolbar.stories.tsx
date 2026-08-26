import {
    Button,
    Field,
    FillSpace,
    FinalForm,
    FinalFormInput,
    FinalFormSaveButton,
    FinalFormSaveSplitButton,
    FinalFormSearchTextField,
    MainContent,
    messages,
    SaveButton,
    SplitButton,
    StackApiContext,
    StackSwitchApiContext,
    Toolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
    ToolbarBreadcrumbs,
    ToolbarItem,
    ToolbarTitleItem,
    useStackApi,
    useStackSwitchApi,
} from "@dextinity/admin";
import { ChevronLeft, DextinityIcon, Search } from "@dextinity/admin-icons";
import { Autocomplete, IconButton, InputAdornment, InputBase, Typography } from "@mui/material";
import { useState } from "react";
import { Form } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { storyRouterDecorator } from "../../../story-router.decorator";
import { toolbarDecorator } from "./toolbar.decorator";

export default {
    title: "Docs/Components/Toolbar",
    decorators: [toolbarDecorator(), storyRouterDecorator()],
};

export const AutomaticTitleItem = () => {
    return (
        <Toolbar>
            <ToolbarAutomaticTitleItem />
        </Toolbar>
    );
};

export const TitleItem = () => {
    return (
        <Toolbar>
            <ToolbarTitleItem>Toolbar Title Item</ToolbarTitleItem>
        </Toolbar>
    );
};

export const LocalizedTitleItem = () => {
    return (
        <Toolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="storybook.toolbartitleitem.title" defaultMessage="Localized Title" />
            </ToolbarTitleItem>
        </Toolbar>
    );
};

export const Breadcrumbs = () => {
    return (
        <Toolbar>
            <ToolbarBackButton />
            <ToolbarBreadcrumbs />
            <FillSpace />
            <ToolbarActions>
                <StackSwitchApiContext.Consumer>
                    {(stackSwitchApi) => (
                        <>
                            <Button
                                onClick={() => {
                                    stackSwitchApi.activatePage("page-1", "details");
                                }}
                            >
                                1
                            </Button>
                            <Button
                                onClick={() => {
                                    stackSwitchApi.activatePage("page-2", "details");
                                }}
                            >
                                2
                            </Button>
                        </>
                    )}
                </StackSwitchApiContext.Consumer>
            </ToolbarActions>
        </Toolbar>
    );
};

export const BackButton = () => {
    return (
        <Toolbar>
            <ToolbarBackButton />
            <ToolbarAutomaticTitleItem />
            <FillSpace />
            <ToolbarActions>
                <StackSwitchApiContext.Consumer>
                    {(stackSwitchApi) => (
                        <Button
                            onClick={() => {
                                stackSwitchApi?.activatePage("automaticTitleDetail", "details");
                            }}
                        >
                            <Typography>Go To Details</Typography>
                        </Button>
                    )}
                </StackSwitchApiContext.Consumer>
            </ToolbarActions>
        </Toolbar>
    );
};

export const FillSpaceLeft = {
    render: () => {
        return (
            <Toolbar>
                <FillSpace />
                <ToolbarActions>
                    <Typography>Item</Typography>
                </ToolbarActions>
            </Toolbar>
        );
    },

    name: "Fill Space left",
};

export const FillSpaceRight = {
    render: () => {
        return (
            <Toolbar>
                <FillSpace />
                <ToolbarItem>
                    <Typography>Item</Typography>
                </ToolbarItem>
                <FillSpace />
            </Toolbar>
        );
    },

    name: "Fill Space right",
};

export const FillSpaceMiddle = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <Typography>Item</Typography>
                </ToolbarItem>
                <FillSpace />
                <ToolbarItem>
                    <Typography>Item</Typography>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Fill Space middle",
};

export const FillSpaceMiddle2 = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <Typography>Item</Typography>
                </ToolbarItem>
                <FillSpace />
                <ToolbarActions>
                    <Button
                        onClick={() => {
                            alert("clicked Action 1");
                        }}
                    >
                        Action 1
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            alert("clicked Action 2");
                        }}
                    >
                        Action 2
                    </Button>
                </ToolbarActions>
                <FillSpace />
                <ToolbarItem>
                    <Typography>Item</Typography>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Fill Space middle 2",
};

export const _ToolbarItem = () => {
    return (
        <Toolbar>
            <ToolbarItem>
                <Typography>Item 1</Typography>
            </ToolbarItem>
            <ToolbarItem>
                <Typography>Item 2</Typography>
            </ToolbarItem>
            <ToolbarItem>
                <Typography>Item 3</Typography>
            </ToolbarItem>
        </Toolbar>
    );
};

export const ToolbarItemMixingWithOtherComponents = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <Typography>Item 1</Typography>
                </ToolbarItem>
                <ToolbarAutomaticTitleItem />
                <ToolbarItem>
                    <Typography>Item 2</Typography>
                </ToolbarItem>
                <ToolbarItem>
                    <Typography>Item 3</Typography>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Toolbar Item mixing with other components",
};

export const ToolbarActionsOneAction = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarAutomaticTitleItem />
                <FillSpace />
                <ToolbarActions>
                    <Button
                        onClick={() => {
                            alert("clicked Action");
                        }}
                    >
                        Action
                    </Button>
                </ToolbarActions>
            </Toolbar>
        );
    },

    name: "Toolbar Actions one action",
};

export const ToolbarActionsTwoActions = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarAutomaticTitleItem />
                <FillSpace />
                <ToolbarActions>
                    <Button
                        onClick={() => {
                            alert("clicked Action 1");
                        }}
                    >
                        Action 1
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            alert("clicked Action 2");
                        }}
                    >
                        Action 2
                    </Button>
                </ToolbarActions>
            </Toolbar>
        );
    },

    name: "Toolbar Actions two actions",
};

export const CustomTitleH1 = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <Typography variant="h1">Custom Title H1</Typography>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Custom Title H1",
};

export const CustomTitleH2 = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <>
                        <DextinityIcon fontSize="large" />
                        <Typography variant="h2">Custom Title H2</Typography>
                    </>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Custom Title H2",
};

export const CustomTitleH3 = {
    render: () => {
        return (
            <Toolbar>
                <div style={{ display: "flex", backgroundColor: "black", alignItems: "center", paddingLeft: 20, paddingRight: 20 }}>
                    <Typography variant="h3" color="primary">
                        Custom Title H3
                    </Typography>
                </div>
            </Toolbar>
        );
    },

    name: "Custom Title H3",
};

export const CustomTitleH4 = {
    render: () => {
        return (
            <Toolbar>
                <ToolbarItem>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="h4">Multi Line - Custom Title H4</Typography>
                        <Typography variant="h4">Multi Line - Custom Title H4</Typography>
                        <Typography variant="h4">Multi Line - Custom Title H4</Typography>
                    </div>
                </ToolbarItem>
            </Toolbar>
        );
    },

    name: "Custom Title H4",
};

export const CustomBackButton = () => {
    return (
        <StackApiContext.Consumer>
            {(stackApi) => (
                <Toolbar>
                    {stackApi && stackApi.breadCrumbs.length > 1 && (
                        <ToolbarItem>
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    stackApi.goBack?.();
                                }}
                                size="large"
                            >
                                <ChevronLeft fontSize="large" />
                                <Typography>Back</Typography>
                            </IconButton>
                        </ToolbarItem>
                    )}
                    <FillSpace />
                    <ToolbarActions>
                        <StackSwitchApiContext.Consumer>
                            {(stackSwitchApi) => (
                                <Button
                                    onClick={() => {
                                        stackSwitchApi?.activatePage("automaticTitleDetail", "details");
                                    }}
                                >
                                    <Typography>Go To Details</Typography>
                                </Button>
                            )}
                        </StackSwitchApiContext.Consumer>
                    </ToolbarActions>
                </Toolbar>
            )}
        </StackApiContext.Consumer>
    );
};

export const FinalFormSearch = () => {
    return (
        <Form
            onSubmit={() => {
                alert("on submit");
            }}
            render={({ values }) => {
                return (
                    <form>
                        <Toolbar>
                            <ToolbarItem>
                                <Field name="query" component={FinalFormSearchTextField} />
                            </ToolbarItem>
                            <ToolbarItem>Debug Final Form Values: {JSON.stringify(values)}</ToolbarItem>
                        </Toolbar>
                    </form>
                );
            }}
        />
    );
};

export const FinalFormSearchCustomIcon = {
    render: () => {
        return (
            <Form
                onSubmit={() => {
                    alert("on submit");
                }}
                render={({ values }) => {
                    return (
                        <form>
                            <Toolbar>
                                <ToolbarItem>
                                    <Field
                                        name="query"
                                        type="text"
                                        component={FinalFormSearchTextField}
                                        icon={<DextinityIcon />}
                                        placeholder="Dextinity Search"
                                    />
                                </ToolbarItem>
                                <ToolbarItem>Debug Final Form Values: {JSON.stringify(values)}</ToolbarItem>
                            </Toolbar>
                        </form>
                    );
                }}
            />
        );
    },

    name: "Search Final Form custom icon",
};

export const WithFinalFormInput = () => {
    return (
        <Form
            onSubmit={() => {
                alert("on submit");
            }}
            render={({ values }) => {
                return (
                    <form>
                        <Toolbar>
                            <ToolbarItem>
                                <Field name="query" type="text" component={FinalFormInput} />
                            </ToolbarItem>
                            <ToolbarItem>Debug Final Form Values: {JSON.stringify(values)}</ToolbarItem>
                        </Toolbar>
                    </form>
                );
            }}
        />
    );
};

export const SearchAutocomplete = () => {
    return (
        <Toolbar>
            <ToolbarItem>
                <Autocomplete
                    popupIcon={null}
                    options={[
                        { name: "Jesse Schmuck" },
                        { name: "Karie Berkman" },
                        { name: "Nena Holliman" },
                        { name: "Gustavo Snay" },
                        { name: "Jaime Santerre" },
                        { name: "Eilene Villanuev" },
                        { name: "Bernetta Kam" },
                        { name: "Amiee Galley" },
                        { name: "Sergio Dement" },
                        { name: "Lily Bellini" },
                        { name: "Isidra Wolff" },
                        { name: "Rex Mikell" },
                        { name: "Stacey Minard" },
                        { name: "Nikia Julien" },
                        { name: "Delbert Worman" },
                        { name: "Essie Delsignor" },
                        { name: "Page Vieira" },
                        { name: "Tamiko Livers" },
                        { name: "Tianna Sheeler" },
                    ]}
                    getOptionLabel={(option) => option.name}
                    style={{ width: 350 }}
                    renderInput={({ InputProps, ...restParams }) => (
                        <InputBase
                            {...restParams}
                            {...InputProps}
                            placeholder="Search"
                            startAdornment={
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            }
                        />
                    )}
                />
            </ToolbarItem>
        </Toolbar>
    );
};

export const Save = () => {
    const [saving, setSaving] = useState(false);
    return (
        <Toolbar>
            <ToolbarTitleItem>Save Button</ToolbarTitleItem>
            <FillSpace />
            <ToolbarActions>
                <SaveButton
                    loading={saving}
                    onClick={() => {
                        setSaving(true);
                        setTimeout(() => {
                            setSaving(false);
                        }, 1000);
                    }}
                >
                    <FormattedMessage {...messages.save} />
                </SaveButton>
            </ToolbarActions>
        </Toolbar>
    );
};

export const _FinalFormSaveButton = () => {
    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const stackSwitchApi = useStackSwitchApi();
    const stackApi = useStackApi();

    return (
        <FinalForm
            mode="edit"
            onSubmit={async () => {
                // add your form-submit function here
                console.log("saving async...");

                await delay(500); // simulate asynchronous submitting

                console.log("saving successful");
            }}
            onAfterSubmit={(values, form) => {
                form.reset(values);
            }}
        >
            {() => {
                const canGoBack = stackApi && stackApi.breadCrumbs.length > 1;

                return (
                    <>
                        <Toolbar>
                            <ToolbarBackButton />
                            <ToolbarTitleItem>Final Form Save Button</ToolbarTitleItem>
                            <FillSpace />
                            <ToolbarActions>
                                {canGoBack ? (
                                    <FinalFormSaveButton />
                                ) : (
                                    <Button
                                        onClick={() => {
                                            stackSwitchApi?.activatePage("automaticTitleDetail", "details");
                                        }}
                                    >
                                        <Typography>Go To Details</Typography>
                                    </Button>
                                )}
                            </ToolbarActions>
                        </Toolbar>
                        {canGoBack && (
                            <MainContent>
                                <Field label="Title" placeholder="Title" name="title" component={FinalFormInput} />
                            </MainContent>
                        )}
                    </>
                );
            }}
        </FinalForm>
    );
};

export const SaveSplitButton = () => {
    const [saving, setSaving] = useState(false);
    return (
        <Toolbar>
            <ToolbarTitleItem>Save Split Button</ToolbarTitleItem>
            <FillSpace />
            <ToolbarActions>
                <SplitButton localStorageKey="Page5.SaveSplitButton" color="primary" variant="contained">
                    <SaveButton
                        loading={saving}
                        onClick={() => {
                            setSaving(true);
                            setTimeout(() => {
                                setSaving(false);
                            }, 1000);
                        }}
                    >
                        <FormattedMessage {...messages.save} />
                    </SaveButton>
                    <SaveButton
                        loading={saving}
                        onClick={() => {
                            setSaving(true);
                            setTimeout(() => {
                                setSaving(false);
                            }, 1000);
                        }}
                    >
                        <FormattedMessage {...messages.saveAndGoBack} />
                    </SaveButton>
                </SplitButton>
            </ToolbarActions>
        </Toolbar>
    );
};

export const _FinalFormSaveSplitButton = () => {
    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const stackSwitchApi = useStackSwitchApi();
    const stackApi = useStackApi();

    return (
        <FinalForm
            mode="edit"
            onSubmit={async (values, form) => {
                // add your form-submit function here
                console.log("saving async...");

                await delay(500); // simulate asynchronous submitting

                console.log("saving successful");
            }}
            onAfterSubmit={(values, form) => {
                form.reset(values);
            }}
        >
            {({ handleSubmit }) => {
                const canGoBack = stackApi && stackApi.breadCrumbs.length > 1;

                return (
                    <>
                        <Toolbar>
                            <ToolbarBackButton />
                            <ToolbarTitleItem>Final Form Save Split Button</ToolbarTitleItem>
                            <FillSpace />
                            <ToolbarActions>
                                {canGoBack ? (
                                    <FinalFormSaveSplitButton localStorageKey="finalformsavesplitbutton" />
                                ) : (
                                    <Button
                                        onClick={() => {
                                            stackSwitchApi?.activatePage("automaticTitleDetail", "details");
                                        }}
                                    >
                                        <Typography>Go To Details</Typography>
                                    </Button>
                                )}
                            </ToolbarActions>
                        </Toolbar>
                        {canGoBack && (
                            <MainContent>
                                <Field label="Title" placeholder="Title" name="title" component={FinalFormInput} />
                            </MainContent>
                        )}
                    </>
                );
            }}
        </FinalForm>
    );
};
