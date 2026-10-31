import { recaptchaClient, recaptchaResourceName } from "./recaptchaClient";

interface Options {
    token: string;
    action: "form_submit" | "file_upload";
    siteKey: string;
    minimalRiskAnalysisScore?: number;
}

export const assessRecaptchaToken = async ({ token, action, siteKey, minimalRiskAnalysisScore = 0.5 }: Options): Promise<boolean> => {
    const [assessment] = await recaptchaClient.createAssessment({
        assessment: {
            event: {
                token,
                siteKey,
            },
        },
        parent: recaptchaResourceName,
    });
    if (!assessment.tokenProperties?.valid) {
        return false;
    }
    if (assessment.tokenProperties.action === action) {
        return assessment.riskAnalysis?.score != null && assessment.riskAnalysis.score > minimalRiskAnalysisScore;
    } else {
        return false;
    }
};
