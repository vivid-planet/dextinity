import { MainContent, Stack, StackPage, StackSwitch, StackToolbar, ToolbarAutomaticTitleItem, ToolbarBackButton } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { CronJobsGrid } from "./CronJobsGrid";
import { JobLogs } from "./JobLogs";
import { JobsGrid } from "./JobsGrid";

export function CronJobsPage() {
    const intl = useIntl();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.pages.cronJobs", defaultMessage: "Cron Jobs" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
                    <MainContent fullHeight>
                        <CronJobsGrid />
                    </MainContent>
                </StackPage>
                <StackPage name="jobs">
                    {(selectedCronJobName) => (
                        <StackSwitch>
                            <StackPage name="grid">
                                <JobsGrid cronJob={selectedCronJobName} />
                            </StackPage>
                            <StackPage name="logs">
                                {(selectedJobName) => (
                                    <>
                                        <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                                            <ToolbarBackButton />
                                            <ToolbarAutomaticTitleItem />
                                        </StackToolbar>
                                        <MainContent>
                                            <JobLogs jobName={selectedJobName} />
                                        </MainContent>
                                    </>
                                )}
                            </StackPage>
                        </StackSwitch>
                    )}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
