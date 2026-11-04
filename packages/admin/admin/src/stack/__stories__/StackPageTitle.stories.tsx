import { useState } from "react";
import { Redirect, Route, Switch } from "react-router";

import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackPageTitle } from "../StackPageTitle";
import { useStackSwitch } from "../Switch";

function Page2() {
    const [counter, setCounter] = useState(0);
    const [StackSwitch, api] = useStackSwitch();
    return (
        <div>
            <button
                onClick={() => {
                    setCounter(counter + 1);
                }}
            >
                {counter}
            </button>
            <StackSwitch>
                <StackPage name="page2-1">
                    <div>page2-1</div>
                    <button
                        onClick={() => {
                            api.activatePage("page2-2", "foo");
                        }}
                    >
                        page2-2
                    </button>
                </StackPage>
                <StackPage name="page2-2">
                    <StackPageTitle title={`Foobar Page2-2: ${counter}`}>
                        <div>page2-2</div>
                    </StackPageTitle>
                </StackPage>
            </StackSwitch>
        </div>
    );
}

function Story() {
    const [counter, setCounter] = useState(0);
    const [StackSwitch, api] = useStackSwitch();
    return (
        <div>
            <button
                onClick={() => {
                    setCounter(counter + 1);
                }}
            >
                {counter}
            </button>
            <Stack topLevelTitle="Stack">
                <StackBreadcrumbs />
                <StackSwitch>
                    <StackPage name="page1">
                        <div>page1</div>
                        <button
                            onClick={() => {
                                api.activatePage("page2", "foo");
                            }}
                        >
                            page2
                        </button>
                        <button
                            onClick={() => {
                                api.activatePage("page3", "foo");
                            }}
                        >
                            page3
                        </button>
                    </StackPage>
                    <StackPage name="page2">
                        <StackPageTitle title={`Foobar Page2: ${counter}`}>
                            <Page2 />
                        </StackPageTitle>
                    </StackPage>
                    <StackPage name="page3">
                        <StackPageTitle title={`Foobar Page3: ${counter}`}>
                            <div>page3</div>
                        </StackPageTitle>
                    </StackPage>
                </StackSwitch>
            </Stack>
        </div>
    );
}

export default {
    title: "components/stack/StackPageTitle",
};

export const _StackPageTitle = () => {
    return (
        <div>
            <p>This story is mainly for testing the StackPageTitle component under various situations.</p>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/foo" />
                </Route>
                <Route path="/foo">
                    <Story />
                </Route>
            </Switch>
        </div>
    );
};
