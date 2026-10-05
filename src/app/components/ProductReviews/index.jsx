"use client";

import { useMemo, useState } from "react";
import { Stars } from "../Stars";
import { Button } from "../Button";
import { Input } from "../Input";
import { useToast } from "../Toast";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "../../../../lib/config";
import styles from "./productReviews.module.css";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
};

export const ProductReviews = ({ productId, initialReviews = [] }) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [reviews, setReviews] = useState(initialReviews);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const displayName = (author.trim() || user?.name || "").trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1) {
      showToast("Selecione uma nota de 1 a 5 estrelas.", { type: "error" });
      return;
    }
    if (!displayName) {
      showToast("Informe seu nome para avaliar.", { type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: displayName,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar avaliação: ${response.status}`);
      }

      const created = await response.json();
      setReviews((prev) => [created, ...prev]);
      setAuthor("");
      setRating(0);
      setHoverRating(0);
      setComment("");
      showToast("Avaliação enviada. Obrigado!", { type: "success" });
    } catch (error) {
      console.error(error);
      showToast("Não foi possível enviar sua avaliação. Tente novamente.", {
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.header}>
        <h2 id="reviews-title" className={styles.title}>
          Avaliações
        </h2>
        {reviews.length > 0 && (
          <div className={styles.summary}>
            <Stars value={average} size={20} showCount={false} />
            <span className={styles.summaryText}>
              {average} de 5 · {reviews.length} avaliação(ões)
            </span>
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.formTitle}>Deixe sua avaliação</h3>

        <div
          className={styles.ratingInput}
          role="radiogroup"
          aria-label="Nota de 1 a 5 estrelas"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={styles.starButton}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} estrela(s)`}
              aria-pressed={rating === n}
            >
              <span
                className={
                  n <= (hoverRating || rating) ? styles.starOn : styles.starOff
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>

        {!user && (
          <Input
            variant="search"
            placeholder="Seu nome"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-label="Seu nome"
          />
        )}

        <textarea
          className={styles.textarea}
          placeholder="Conte o que achou do produto (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          aria-label="Comentário"
        />

        <Button
          type="submit"
          variant="primary"
          size="medium"
          disabled={submitting}
        >
          {submitting ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </form>

      <ul className={styles.list}>
        {reviews.length === 0 && (
          <li className={styles.empty}>
            Ainda não há avaliações. Seja o primeiro a avaliar!
          </li>
        )}
        {reviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <div className={styles.reviewHeader}>
              <strong>{review.author}</strong>
              <Stars value={review.rating} showCount={false} />
            </div>
            {review.comment && <p className={styles.comment}>{review.comment}</p>}
            <span className={styles.date}>{formatDate(review.createdAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductReviews;
