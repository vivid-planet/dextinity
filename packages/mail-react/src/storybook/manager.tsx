/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { type PropsWithChildren, type ReactNode } from "react";
import { addons, types, useParameter } from "storybook/manager-api";

import { CopyMailHtmlButton } from "./CopyMailHtmlButton.js";
import { MjmlWarningsPanel, MjmlWarningsPanelTitle } from "./MjmlWarningsPanel.js";
import { UsePublicImageUrlsToggle } from "./UsePublicImageUrlsToggle.js";

const ADDON_ID = "dextinity-mail-react";
const ADDON_UI_PARAMETER = "showDextinityMailAddonUi";

function WhenAddonUiEnabled({ children }: PropsWithChildren): ReactNode {
    const shouldShowAddonUi = useParameter(ADDON_UI_PARAMETER, false);

    return shouldShowAddonUi ? children : null;
}

addons.register(ADDON_ID, () => {
    addons.add(`${ADDON_ID}/copy-html`, {
        type: types.TOOL,
        title: "Copy Mail HTML",
        render: () => (
            <WhenAddonUiEnabled>
                <CopyMailHtmlButton />
            </WhenAddonUiEnabled>
        ),
    });

    addons.add(`${ADDON_ID}/public-urls`, {
        type: types.TOOL,
        title: "Use public image URLs",
        render: () => (
            <WhenAddonUiEnabled>
                <UsePublicImageUrlsToggle />
            </WhenAddonUiEnabled>
        ),
    });

    addons.add(`${ADDON_ID}/mjml-warnings`, {
        type: types.PANEL,
        title: () => <MjmlWarningsPanelTitle />,
        disabled: (parameters) => !parameters?.[ADDON_UI_PARAMETER],
        render: ({ active }) => <MjmlWarningsPanel active={Boolean(active)} />,
    });
});
