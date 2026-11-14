import styles from "./Foundations.module.scss";

export interface NumberedListProps {
    items: { title: string; description: string }[];
}

/**
 * A numbered list of titled steps or layers.
 */
export function NumberedList({ items }: NumberedListProps) {
    return (
        <ol className={styles.numberedList}>
            {items.map((item, index) => (
                <li key={item.title}>
                    <span className={styles.number}>{index + 1}</span>
                    <div>
                        <b>{item.title}</b>
                        <span>{item.description}</span>
                    </div>
                </li>
            ))}
        </ol>
    );
}
