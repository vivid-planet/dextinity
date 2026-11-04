import { makeVar } from "@apollo/client";

import type { ErrorDialogOptions } from "./ErrorDialog";

export const errorDialogVar = makeVar<ErrorDialogOptions | undefined>(undefined);
