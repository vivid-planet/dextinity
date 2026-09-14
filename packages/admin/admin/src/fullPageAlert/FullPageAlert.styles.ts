import { Card, css, Divider, Typography } from "@mui/material";

import { createComponentSlot } from "../helpers/createComponentSlot";
import { InlineAlert } from "../inlineAlert/InlineAlert";
import type { FullPageAlertClassKey } from "./FullPageAlert";
import { FullPageAlertBackground } from "./FullPageAlertBackground";

export const Root = createComponentSlot("div")<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "root",
})(css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`);

export const BackgroundStyled = createComponentSlot(FullPageAlertBackground)<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "background",
})(css`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
`);

export const ContentContainer = createComponentSlot(Card)<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "contentContainer",
})(({ theme }) => {
    return css`
        display: flex;
        max-width: 550px;
        align-items: center;
        gap: ${theme.spacing(2)};
        flex-direction: column;
        padding: ${theme.spacing(10)};
    `;
});

export const DetailDescription = createComponentSlot(Typography)<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "detailDescription",
})();

export const DividerStyled = createComponentSlot(Divider)<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "divider",
})(
    ({ theme }) => css`
        width: 100%;
        margin-top: ${theme.spacing(6)};
        margin-bottom: ${theme.spacing(6)};
    `,
);

export const LogoContainer = createComponentSlot("div")<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "logoContainer",
})(
    ({ theme }) => css`
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: ${theme.spacing(6)};
    `,
);

export const ActionContainer = createComponentSlot("div")<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "actionContainer",
})(css`
    width: 100%;
    display: flex;
`);

export const InlineAlertStyled = createComponentSlot(InlineAlert)<FullPageAlertClassKey>({
    componentName: "FullPageAlert",
    slotName: "inlineAlert",
})(css``);
