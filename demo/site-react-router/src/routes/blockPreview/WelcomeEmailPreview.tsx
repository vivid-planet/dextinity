import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";

export function WelcomeEmailPreview({ data }: { data: WelcomeEmailContentBlockData }) {
    return <RenderedMailForBlockPreview mail={(props) => <WelcomeEmailMail content={data} {...props} />} />;
}
