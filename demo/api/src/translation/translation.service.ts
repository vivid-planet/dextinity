import { Inject, Injectable } from "@nestjs/common";
import type { Config } from "@src/config/config.js";
import { CONFIG } from "@src/config/config.module.js";
import { loadMessages } from "@src/translation/loadMessages.js";
import { createIntl, createIntlCache, type IntlCache } from "react-intl";

@Injectable()
export class TranslationService {
    private readonly intlCache: IntlCache;
    constructor(@Inject(CONFIG) private readonly config: Config) {
        this.intlCache = createIntlCache();
    }

    async getIntl(language: string) {
        return createIntl(
            {
                // Locale of the application
                locale: language,
                // Locale of the fallback defaultMessage
                defaultLocale: this.config.defaultLocale,
                messages: await loadMessages(language),
            },
            this.intlCache,
        );
    }
}
