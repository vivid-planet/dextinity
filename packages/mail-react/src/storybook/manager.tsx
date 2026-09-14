/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from "react";
import { addons, types } from "storybook/manager-api";

import { CopyMailHtmlButton } from "./CopyMailHtmlButton.js";
import { MjmlWarningsPanel, MjmlWarningsPanelTitle } from "./MjmlWarningsPanel.js";
import { UsePublicImageUrlsToggle } from "./UsePublicImageUrlsToggle.js";

const ADDON_ID = "dextinity-mail-react";

addons.register(ADDON_ID, () => {
    addons.add(`${ADDON_ID}/copy-html`, {
        type: types.TOOL,
        title: "Copy Mail HTML",
        render: () => <CopyMailHtmlButton />,
    });

    addons.add(`${ADDON_ID}/public-urls`, {
        type: types.TOOL,
        title: "Use public image URLs",
        render: () => <UsePublicImageUrlsToggle />,
    });

    addons.add(`${ADDON_ID}/mjml-warnings`, {
        type: types.PANEL,
        title: () => <MjmlWarningsPanelTitle />,
        render: ({ active }) => <MjmlWarningsPanel active={Boolean(active)} />,
    });
});
