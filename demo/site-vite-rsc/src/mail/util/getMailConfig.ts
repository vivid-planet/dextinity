import type { Config } from "@dextinity/mail-react";
import type { ContentScope } from "@src/site-configs";
import { getSiteConfigForDomain } from "@src/util/siteConfig";

import { createMailConfig } from "./createMailConfig";

export function getMailConfig(scope: ContentScope): Config {
    return createMailConfig(getSiteConfigForDomain(scope.domain).url);
}
