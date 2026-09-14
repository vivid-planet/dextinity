"use client";

import { useEffect, useState } from "react";

import type { CookieApiHook } from "./CookieApiContext";

type WindowWithCookiebot = Window & {
    Cookiebot: {
        // `consent` is only populated once Cookiebot has initialized and fired `CookiebotOnConsentReady`.
        // `window.Cookiebot` already exists once the script has run, so `consent` must be treated as optional.
        consent?: Record<string, boolean>;
        renew: () => void;
        [key: string]: unknown;
    };
};

const isWindowWithCookiebot = (window: Window): window is WindowWithCookiebot => {
    return "Cookiebot" in window;
};

export const useCookieBotCookieApi: CookieApiHook = () => {
    const [consentedCookies, setConsentedCookies] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const handleCookieUpdated = () => {
            if (isWindowWithCookiebot(window)) {
                const consentedList = window.Cookiebot.consent;
                // The initial call can run before Cookiebot has finished initializing, when `consent` is not
                // yet populated. Calling `Object.keys` on it would throw, so bail out until it's available.
                if (!consentedList) {
                    return;
                }
                setInitialized(true);
                setConsentedCookies(Object.keys(consentedList).filter((key) => consentedList[key]));
            }
        };

        window.addEventListener("CookiebotOnConsentReady", handleCookieUpdated);

        // Initial consent
        handleCookieUpdated();

        return () => {
            window.removeEventListener("CookiebotOnConsentReady", handleCookieUpdated);
        };
    }, []);

    return {
        initialized,
        consentedCookies,
        openCookieSettings: () => {
            if (isWindowWithCookiebot(window)) {
                window.Cookiebot.renew();
            }
        },
    };
};
