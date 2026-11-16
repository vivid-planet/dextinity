import type { WarningSeverity } from "../entities/warning-severity.enum.js";

export interface WarningData {
    message: string;
    severity: `${WarningSeverity}`;
}
