"use client";

import { useState, useMemo } from "react";
import styles from "./nossaslojas.module.css";
import { stores } from "./stores";

// Monta a URL de busca do Google Maps para o endereço da loja.
const mapsUrl = (store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.address}, ${store.city} - ${store.state}`
  )}`;

export const StoreList = () => {
  const [uf, setUf] = useState("todos");

  // Estados disponíveis (distintos), em ordem alfabética
  const estados = useMemo(
    () => [...new Set(stores.map((s) => s.state))].sort(),
    []
  );

  const filtered =
    uf === "todos" ? stores : stores.filter((s) => s.state === uf);

  return (
    <>
      <div className={styles.filterBar}>
        <label htmlFor="uf" className={styles.filterLabel}>
          Filtrar por estado:
        </label>
        <select
          id="uf"
          className={styles.select}
          value={uf}
          onChange={(e) => setUf(e.target.value)}
        >
          <option value="todos">Todos os estados</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <span className={styles.count}>{filtered.length} loja(s)</span>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((store) => (
            <article key={store.id} className={styles.card}>
              <h2 className={styles.name}>{store.name}</h2>
              <p className={styles.address}>
                {store.address}
                <br />
                {store.city} - {store.state}
              </p>
              <p className={styles.meta}>🕒 {store.hours}</p>
              <p className={styles.meta}>📞 {store.phone}</p>
              <a
                className={styles.mapsLink}
                href={mapsUrl(store)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Como chegar →
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          Nenhuma loja encontrada para este estado.
        </p>
      )}
    </>
  );
};
