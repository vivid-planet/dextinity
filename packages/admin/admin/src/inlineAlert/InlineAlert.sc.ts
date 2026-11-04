import { Typography } from "@mui/material";
import { css } from "@mui/material/styles";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { InlineAlertClassKey } from "./InlineAlert";

export const Root = createComponentSlot("div")<InlineAlertClassKey>({
    componentName: "InlineAlert",
    slotName: "root",
})(css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0;
`);

export const IconContainer = createComponentSlot("div")<InlineAlertClassKey>({
    componentName: "InlineAlert",
    slotName: "iconContainer",
})(
    ({ theme }) => css`
        margin-bottom: ${theme.spacing(2)};
    `,
);

export const Title = createComponentSlot(Typography)<InlineAlertClassKey>({
    componentName: "InlineAlert",
    slotName: "title",
})(
    ({ theme }) => css`
        text-align: center;
        margin-bottom: ${theme.spacing(1)};
    `,
);

export const Description = createComponentSlot(Typography)<InlineAlertClassKey>({
    componentName: "InlineAlert",
    slotName: "description",
})(css`
    text-align: center;
`);

export const ActionsContainer = createComponentSlot("div")<InlineAlertClassKey>({
    componentName: "InlineAlert",
    slotName: "actionsContainer",
})(
    ({ theme }) => css`
        margin-top: ${theme.spacing(4)};
    `,
);
