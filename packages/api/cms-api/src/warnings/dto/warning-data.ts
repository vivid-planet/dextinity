import type { WarningSeverity } from "../entities/warning-severity.enum";

export interface WarningData {
    message: string;
    severity: `${WarningSeverity}`;
}
