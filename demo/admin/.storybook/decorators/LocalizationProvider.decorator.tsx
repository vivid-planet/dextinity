import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { Decorator } from "@storybook/react-vite";
import { enUS } from "date-fns/locale";

export const LocalizationProviderDecorator: Decorator = (Story) => (
    <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
        <Story />
    </LocalizationProvider>
);
