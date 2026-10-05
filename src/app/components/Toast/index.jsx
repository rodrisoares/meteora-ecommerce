"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import styles from "./toast.module.css";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return context;
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const { type = "success", duration = 3000 } = options;
      const id = ++idCounter;

      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  // Estável entre renders (não muda quando os toasts entram/saem),
  // evitando re-render de todos os consumidores de useToast.
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={styles.container}
        role="region"
        aria-live="polite"
        aria-label="Notificações"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type] ?? ""}`}
            role="status"
          >
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
