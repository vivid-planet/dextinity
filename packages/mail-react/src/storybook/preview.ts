import { MailRendererDecorator } from "./MailRendererDecorator.js";

export const decorators = [MailRendererDecorator];

export const initialGlobals = {
    usePublicImageUrls: false,
};

export const parameters = {
    showDextinityMailAddonUi: true,
    viewport: {
        options: {
            mobile: {
                name: "Mobile (375px)",
                styles: { width: "375px", height: "1024px" },
            },
            tablet: {
                name: "Tablet (500px)",
                styles: { width: "500px", height: "1024px" },
            },
            emailWidth: {
                name: "Email max-width (600px)",
                styles: { width: "600px", height: "1024px" },
            },
            desktop: {
                name: "Desktop (768px)",
                styles: { width: "768px", height: "1024px" },
            },
        },
    },
};
