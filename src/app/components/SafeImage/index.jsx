"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./safeImage.module.css";

// Placeholder de blur (SVG cinza claro) — evita layout shift enquanto a imagem carrega.
const shimmer = (w, h) =>
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#eeeeee"/></svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;

/**
 * Wrapper de next/image com:
 * - blur placeholder enquanto carrega
 * - fallback visual caso a imagem quebre (onError)
 */
export const SafeImage = ({ alt, className, width, height, style, ...props }) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`${styles.fallback} ${className ?? ""}`.trim()}
        style={{ width, height, ...style }}
        role="img"
        aria-label={alt}
      >
        <span aria-hidden="true">🖼️</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      width={width}
      height={height}
      style={style}
      className={className}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setErrored(true)}
    />
  );
};

export default SafeImage;
