import "react";

type AiHubChatAttributes = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    "api-url"?: string;
    "widget-id"?: string;
    "user-id"?: string;
    language?: string;
    height?: number;
    width?: number;
    "integration-location"?: string;
};

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "ai-hub-chat": AiHubChatAttributes;
        }
    }
}
