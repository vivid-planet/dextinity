import type { Meta, StoryObj } from "@storybook/react-vite";

import { DiffViewer } from "../DiffViewer";

type Story = StoryObj<typeof DiffViewer>;
const meta: Meta<typeof DiffViewer> = {
    component: DiffViewer,
    title: "actionLog/components/diffViewer/DiffViewer",
};
export default meta;

export const StandardDiffViewer: Story = {
    args: {
        newValue: "ipsum",
        oldValue: "lorem",
    },
};

export const UserProfileUpdate: Story = {
    args: {
        oldValue: JSON.stringify(
            {
                name: "John Smith",
                email: "john.smith@example.com",
                roles: ["editor"],
                preferences: {
                    theme: "light",
                    notifications: {
                        email: true,
                        push: false,
                    },
                },
                lastLogin: "2025-07-01T10:30:00Z",
            },
            null,
            4,
        ),
        newValue: JSON.stringify(
            {
                name: "John Smith",
                email: "john.smith@newcompany.com",
                roles: ["editor", "admin"],
                preferences: {
                    theme: "dark",
                    notifications: {
                        email: true,
                        push: true,
                    },
                },
                lastLogin: "2025-08-12T15:45:00Z",
            },
            null,
            4,
        ),
    },
};

export const ContentBlockChanges: Story = {
    args: {
        oldValue: JSON.stringify(
            {
                id: "hero-section",
                type: "hero",
                content: {
                    title: "Welcome to Our Platform",
                    subtitle: "Discover Amazing Features",
                    cta: {
                        text: "Get Started",
                        url: "/signup",
                    },
                    background: {
                        type: "image",
                        src: "/assets/hero-bg.jpg",
                    },
                },
                layout: {
                    width: "full",
                    textAlign: "center",
                },
            },
            null,
            4,
        ),
        newValue: JSON.stringify(
            {
                id: "hero-section",
                type: "hero",
                content: {
                    title: "Transform Your Business Today",
                    subtitle: "Powerful Solutions for Modern Challenges",
                    cta: {
                        text: "Start Free Trial",
                        url: "/trial",
                        variant: "primary",
                    },
                    background: {
                        type: "video",
                        src: "/assets/hero-video.mp4",
                        poster: "/assets/video-poster.jpg",
                    },
                },
                layout: {
                    width: "contained",
                    textAlign: "left",
                    spacing: "large",
                },
            },
            null,
            4,
        ),
    },
};

export const LongTextDiff: Story = {
    args: {
        oldValue: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        newValue: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

This paragraph has been completely changed to show how text modifications appear in the diff viewer. It's particularly useful when reviewing content changes or documentation updates.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    },
};
