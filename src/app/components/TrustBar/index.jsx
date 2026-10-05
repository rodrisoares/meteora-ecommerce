import SVGIcon from "../SVGIcons";
import styles from "./trustBar.module.css";

// Faixa de benefícios/confiança — reforça segurança e conveniência para
// aumentar a conversão. Componente estático (server component).
const ITEMS = [
  {
    icon: "truck",
    title: "Frete grátis",
    text: "Acima de R$ 200 para todo o Brasil",
  },
  {
    icon: "repeat",
    title: "Troca fácil",
    text: "Até 30 dias para trocar ou devolver",
  },
  {
    icon: "shield",
    title: "Pagamento seguro",
    text: "Ambiente 100% protegido",
  },
  {
    icon: "card",
    title: "Parcele em até 6x",
    text: "Sem juros no cartão de crédito",
  },
];

export const TrustBar = () => {
  return (
    <section className={styles.trustBar} aria-label="Nossos diferenciais">
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <SVGIcon iconName={item.icon} width="28" height="28" />
            </span>
            <div className={styles.text}>
              <strong className={styles.title}>{item.title}</strong>
              <span className={styles.subtitle}>{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
