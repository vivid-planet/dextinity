import { useDextinityConfig } from "../../../../config/DextinityConfigContext";
import type { BuildInformation } from "./buildInformation";

export function useBuildInformation(): BuildInformation | undefined {
    return useDextinityConfig().buildInformation;
}
