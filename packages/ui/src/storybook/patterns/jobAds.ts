import type { StatusIndicatorStatus } from "../../components/statusIndicator/StatusIndicator";

export type JobAdStatus = Extract<StatusIndicatorStatus, "published" | "unpublished" | "archived">;

export interface JobAd {
    id: string;
    title: string;
    status: JobAdStatus;
    location: string;
}

/**
 * The draft's sample job ads, shared by the pattern stories.
 */
export const jobAds: JobAd[] = [
    { id: "1", title: "Senior UX Designer", status: "published", location: "Vienna" },
    { id: "2", title: "Frontend Developer", status: "published", location: "Graz" },
    { id: "3", title: "Product Owner CMS", status: "unpublished", location: "Vienna" },
    { id: "4", title: "Marketing Working Student", status: "published", location: "Salzburg" },
    { id: "5", title: "QA Engineer", status: "archived", location: "Graz" },
    { id: "6", title: "UI Designer", status: "unpublished", location: "Vienna" },
    { id: "7", title: "DevOps Engineer", status: "published", location: "Salzburg" },
];
