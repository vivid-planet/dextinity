export const AI_HUB_CONFIG = "ai-hub-config";

export type AiHubConfig = {
    /** The URL the AI Hub API is served at, e.g. `https://ai-hub.example.com`. The proxy appends the API's paths, such as `/api/v2/chat`. */
    apiUrl: string;
    apiKey: string;
};
