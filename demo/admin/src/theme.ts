import { createDextinityTheme } from "@dextinity/admin";

export const createTheme = (muiLocale: object[]) => createDextinityTheme({}, ...muiLocale);
