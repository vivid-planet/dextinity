import { Icon } from "../../../components/icon/Icon";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

export interface DoDontProps {
    dos: string[];
    donts: string[];
}

/**
 * The draft's rules block: what to do, and what not to.
 */
export function DoDont({ dos, donts }: DoDontProps) {
    return (
        <DocsDemo>
            <div className={styles.doDont}>
                <div className={styles.do}>
                    <b>
                        <Icon name="check" size="small" />
                        Do
                    </b>
                    <ul>
                        {dos.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.dont}>
                    <b>
                        <Icon name="x" size="small" />
                        Don't
                    </b>
                    <ul>
                        {donts.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </DocsDemo>
    );
}
