import { CookieApiProvider } from "@dextinity/site-nextjs";
import { cookieIds } from "@src/util/cookieIds";
import type { Decorator } from "@storybook/nextjs-vite";

// The site gets the consent from OneTrust or local storage. Stories consent to all cookies by default, so cookie-protected
// content such as YouTube videos renders. Set the `consentedCookies` parameter to render a story without consent.
export const CookieApiProviderDecorator: Decorator = (Story, { parameters }) => {
    const consentedCookies: string[] = parameters.consentedCookies ?? Object.values(cookieIds);

    return (
        <CookieApiProvider
            api={() => ({
                initialized: true,
                consentedCookies,
                openCookieSettings: () => {
                    // noop
                },
            })}
        >
            <Story />
        </CookieApiProvider>
    );
};
