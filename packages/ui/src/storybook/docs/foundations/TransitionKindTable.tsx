import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";
import { pageTransitionKinds } from "./PageTransitionDemo";

/**
 * When to use which page transition.
 */
export function TransitionKindTable() {
    return (
        <DocsDemo>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Kind</th>
                        <th>When</th>
                    </tr>
                </thead>
                <tbody>
                    {pageTransitionKinds.map(({ kind, title, when }) => (
                        <tr key={kind}>
                            <td>
                                <b>{title}</b>
                            </td>
                            <td>{when}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DocsDemo>
    );
}
