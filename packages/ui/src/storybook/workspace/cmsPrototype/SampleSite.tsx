import { type PropsWithChildren, useState } from "react";

import { DevicePreview, type DevicePreviewDevice } from "../../../components/devicePreview/DevicePreview";
import styles from "./cmsPrototype.module.scss";

/**
 * The website the CMS edits, in the preview of an editor.
 */
export function SampleSite({ url, image, children }: PropsWithChildren<{ url: string; image?: string }>) {
    const [device, setDevice] = useState<DevicePreviewDevice>("desktop");
    return (
        <DevicePreview url={url} device={device} onDeviceChange={setDevice}>
            <div className={styles.site}>
                <header className={styles.siteHeader}>
                    <span className={styles.siteLogo}>Example Inc.</span>
                    <nav className={styles.siteNav}>
                        <span>Products</span>
                        <span>Services</span>
                        <span>About us</span>
                        <span>News</span>
                    </nav>
                </header>
                {image != null ? <img className={styles.siteStage} src={image} alt="" /> : <div className={styles.siteStage} />}
                <main className={styles.siteMain}>{children}</main>
            </div>
        </DevicePreview>
    );
}
