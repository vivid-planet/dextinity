import {
    Button,
    Stack,
    StackBackButton,
    StackBreadcrumbs,
    StackLink,
    StackPage,
    StackPageTitle,
    StackSwitch,
    Toolbar,
    ToolbarBackButton,
    ToolbarBreadcrumbs,
    Tooltip,
    useStackSwitch,
    useStackSwitchApi,
} from "@dextinity/admin";
import { ArrowLeft, ArrowRight } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";

import { apolloRestStoryDecorator } from "../../../apollo-rest-story.decorator";
import { storyRouterDecorator } from "../../../story-router.decorator";

export default {
    title: "Docs/Components/Stack",
    decorators: [apolloRestStoryDecorator(), storyRouterDecorator()],
};

export const Basic = {
    render: () => {
        return (
            <Stack topLevelTitle="Example Stack">
                <StackSwitch>
                    <StackPage name="page1">
                        <Page1 />
                    </StackPage>
                    <StackPage name="page2">
                        <Page2 />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );

        function Page1() {
            const switchApi = useStackSwitchApi();
            return (
                <>
                    <h3>Page 1</h3>
                    <button
                        onClick={(e) => {
                            switchApi.activatePage("page2", "test");
                        }}
                    >
                        activate page2
                    </button>
                </>
            );
        }

        function Page2() {
            const switchApi = useStackSwitchApi();
            return (
                <>
                    <h3>Page 2</h3>
                    <button
                        onClick={(e) => {
                            switchApi.activatePage("page1", "");
                        }}
                    >
                        activate page1
                    </button>
                </>
            );
        }
    },
};

export const Payload = () => {
    return (
        <Stack topLevelTitle="Example Stack">
            <StackSwitch>
                <StackPage name="page1">
                    <Foo payload="test1" />
                    <Foo payload="test2" />
                </StackPage>
                <StackPage name="page2">{(payload) => <div>Passed payload: {payload}</div>}</StackPage>
            </StackSwitch>
        </Stack>
    );

    function Foo({ payload }: { payload: string }) {
        const switchApi = useStackSwitchApi();
        return (
            <button
                onClick={(e) => {
                    switchApi.activatePage("page2", payload);
                }}
            >
                activate page2 with payload {payload}
            </button>
        );
    }
};

export const Nested = () => {
    return (
        <Stack topLevelTitle="Example Stack">
            <StackBackButton />
            <StackBreadcrumbs />
            <StackSwitch>
                <StackPage name="page1">
                    <Page1 />
                </StackPage>
                <StackPage name="page2">
                    <Page2 />
                </StackPage>
            </StackSwitch>
        </Stack>
    );

    function Page1() {
        const switchApi = useStackSwitchApi();
        return (
            <>
                <h3>Page 1</h3>
                <button
                    onClick={(e) => {
                        switchApi.activatePage("page2", "test");
                    }}
                >
                    activate page2
                </button>
            </>
        );
    }

    function Page2() {
        return (
            <StackSwitch>
                <StackPage name="page2-1">
                    <Page2_1 />
                </StackPage>
                <StackPage name="page2-2">page 2-2</StackPage>
            </StackSwitch>
        );
    }

    function Page2_1() {
        const switchApi = useStackSwitchApi();
        return (
            <>
                <h3>Page 2-1</h3>
                <button
                    onClick={(e) => {
                        switchApi.activatePage("page2-2", "test");
                    }}
                >
                    activate page2-2
                </button>
            </>
        );
    }
};

export const BreadcrumbsToolbar = {
    render: () => {
        return (
            <Stack topLevelTitle="Example Stack">
                <Toolbar>
                    <ToolbarBackButton />
                    <ToolbarBreadcrumbs />
                </Toolbar>
                <StackSwitch>
                    <StackPage name="page1">
                        <Page1 />
                    </StackPage>
                    <StackPage name="page2">
                        <Page2 />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );

        function Page1() {
            const switchApi = useStackSwitchApi();
            return (
                <>
                    <h3>Page 1</h3>
                    <button
                        onClick={(e) => {
                            switchApi.activatePage("page2", "test");
                        }}
                    >
                        activate page2
                    </button>
                </>
            );
        }

        function Page2() {
            return (
                <StackSwitch>
                    <StackPage name="page2-1">
                        <Page2_1 />
                    </StackPage>
                    <StackPage name="page2-2">page 2-2</StackPage>
                </StackSwitch>
            );
        }

        function Page2_1() {
            const switchApi = useStackSwitchApi();
            return (
                <>
                    <h3>Page 2-1</h3>
                    <button
                        onClick={(e) => {
                            switchApi.activatePage("page2-2", "test");
                        }}
                    >
                        activate page2-2
                    </button>
                </>
            );
        }
    },

    name: "BreadrumbsToolbar",
};

export const DynamicTitle = {
    render: () => {
        return (
            <Stack topLevelTitle="Example Stack">
                <Toolbar>
                    <ToolbarBackButton />
                    <ToolbarBreadcrumbs />
                </Toolbar>
                <StackSwitch>
                    <StackPage name="page1">
                        <Foo payload="test1" />
                        <Foo payload="test2" />
                    </StackPage>
                    <StackPage name="page2">
                        {(payload) => (
                            <StackPageTitle title={payload}>
                                <div>Passed payload: {payload}</div>
                            </StackPageTitle>
                        )}
                    </StackPage>
                </StackSwitch>
            </Stack>
        );

        function Foo({ payload }: { payload: string }) {
            const switchApi = useStackSwitchApi();
            return (
                <button
                    onClick={(e) => {
                        switchApi.activatePage("page2", payload);
                    }}
                >
                    activate page2 with payload {payload}
                </button>
            );
        }
    },

    name: "DynamicTitle",
};

export const UseStackSwitch = {
    render: () => {
        const [StackSwitch, switchApi] = useStackSwitch();
        return (
            <div>
                <p>
                    <button
                        onClick={() => {
                            switchApi.activatePage("page2", "foo");
                        }}
                    >
                        page2
                    </button>
                </p>
                <p>
                    <StackLink pageName="page2" payload="foo" switchApi={switchApi}>
                        link to page2
                    </StackLink>
                </p>
                <Stack topLevelTitle="Stack">
                    <StackBreadcrumbs />
                    <StackSwitch>
                        <StackPage name="page1">
                            <div>page1</div>
                        </StackPage>
                        <StackPage name="page2">
                            <div>page2</div>
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </div>
        );
    },

    name: "useStackSwitch",
};

export const StackLinkMuiLink = {
    render: () => {
        return (
            <Stack topLevelTitle="Example Stack with StackLinks">
                <StackSwitch>
                    <StackPage name="page1">
                        <h3>Page 1</h3>
                        <StackLink pageName="page2" payload="test">
                            StackLink-based MuiLink to page2
                        </StackLink>
                    </StackPage>
                    <StackPage name="page2">
                        <h3>Page 2</h3>
                        <StackLink pageName="page1" payload="test">
                            StackLink-based MuiLink to page1
                        </StackLink>
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    },

    name: "StackLink MuiLink",
};

export const StackLinkButton = {
    render: () => {
        return (
            <Stack topLevelTitle="Example Stack with StackLinks">
                <StackSwitch>
                    <StackPage name="page1">
                        <h3>Page 1</h3>
                        <Button component={StackLink} pageName="page2" payload="test">
                            StackLink-based Button to page2
                        </Button>
                        <Tooltip title="StackLink-based IconButton to page2">
                            <IconButton component={StackLink} pageName="page2" payload="test">
                                <ArrowRight />
                            </IconButton>
                        </Tooltip>
                    </StackPage>
                    <StackPage name="page2">
                        <h3>Page 2</h3>
                        <Button component={StackLink} pageName="page1" payload="test">
                            StackLink-based Button to page1
                        </Button>
                        <Tooltip title="StackLink-based IconButton to page1">
                            <IconButton component={StackLink} pageName="page1" payload="test">
                                <ArrowLeft />
                            </IconButton>
                        </Tooltip>
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    },

    name: "StackLink Button",
};
