"use client";

import { useEffect, useState } from "react";

import type { CookieApiHook } from "./CookieApiContext";

type OneTrustOnConsentChangedEvent = {
    detail: string[];
    [key: string]: unknown;
};

type OnConsentChangedCallback = (event: OneTrustOnConsentChangedEvent) => void;

type OneTrust = {
    ToggleInfoDisplay: () => void;
    OnConsentChanged: (callback: OnConsentChangedCallback) => void;
    [key: string]: unknown;
};

type WindowWithOneTrust = Window & {
    OneTrust: OneTrust;
    OnetrustActiveGroups?: string;
};

const isWindowWithOneTrust = (window: Window): window is WindowWithOneTrust => {
    return "OneTrust" in window;
};

export const useOneTrustCookieApi: CookieApiHook = () => {
    const [consentedCookies, setConsentedCookies] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const startListeningForConsentChanges = (window: WindowWithOneTrust) => {
            const oneTrust = window.OneTrust;
            const initialCookieConsent: string[] = [];

            if (window.OnetrustActiveGroups) {
                initialCookieConsent.push(
                    ...window.OnetrustActiveGroups.split(",")
                        .map((groupId) => groupId.trim())
                        .filter(Boolean),
                );
            }

            setConsentedCookies(initialCookieConsent);

            oneTrust.OnConsentChanged((event) => {
                setConsentedCookies(event.detail);
            });
        };

        const tryToAccessOneTrustInterval = setInterval(() => {
            if (isWindowWithOneTrust(window)) {
                setInitialized(true);
                clearInterval(tryToAccessOneTrustInterval);
                startListeningForConsentChanges(window);
            }
        }, 200);

        return () => {
            clearInterval(tryToAccessOneTrustInterval);
        };
    }, []);

    return {
        initialized,
        consentedCookies,
        openCookieSettings: () => {
            if (isWindowWithOneTrust(window)) {
                window.OneTrust.ToggleInfoDisplay();
            }
        },
    };
};
