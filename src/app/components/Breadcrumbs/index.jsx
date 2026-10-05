import Link from "next/link";
import styles from "./breadcrumbs.module.css";

// items: [{ label, href? }] — o último item é a página atual (sem link)
export const Breadcrumbs = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
