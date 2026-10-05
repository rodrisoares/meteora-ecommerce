import styles from "./nossaslojas.module.css";
import { StoreList } from "./StoreList";

export const metadata = {
  title: "Nossas Lojas | Meteora",
  description:
    "Encontre a loja física da Meteora mais perto de você e experimente as peças pessoalmente.",
};

export default function NossasLojasPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.tag}>📍 Lojas físicas</span>
        <h1>Nossas Lojas</h1>
        <p>Visite a Meteora pertinho de você e experimente as peças pessoalmente.</p>
      </section>

      <StoreList />
    </main>
  );
}
