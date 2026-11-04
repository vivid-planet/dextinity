import { useLocation } from "react-router";

import { RouterTab, RouterTabs } from "../RouterTabs";

export default {
    title: "components/tabs/RouterTabs",
};

export const Basic = {
    render: () => {
        const location = useLocation();

        return (
            <div>
                <p>Location: {location.pathname}</p>
                <RouterTabs>
                    <RouterTab path="" label="Label One">
                        Content One
                    </RouterTab>
                    <RouterTab path="/tab2" label="Label Two">
                        Content Two
                    </RouterTab>
                    <RouterTab path="/tab3" label="Label Three">
                        Content Three
                    </RouterTab>
                </RouterTabs>
            </div>
        );
    },

    name: "RouterTabs",
};
