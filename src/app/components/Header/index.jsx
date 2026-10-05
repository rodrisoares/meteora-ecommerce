"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CarrinhoIcon,
  PerfilIcon,
  HeartIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
} from "../../common/icons";
import { ThemeToggle } from "../ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./header.module.css";
import logo from "./logo.png";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/produtos", label: "Produtos" },
  { href: "/promocoes", label: "Promoções" },
  { href: "/nossas-lojas", label: "Nossas Lojas" },
];

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, logout, hydrated } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  // Marca o link do menu correspondente à rota atual.
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    closeMenu();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  // Fecha o dropdown de conta ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!accountOpen) return;

    const onPointerDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <Image
            src={logo}
            alt="Meteora — página inicial"
            width={100}
            height={22}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <ul
          id="main-menu"
          className={`${styles.menu} ${menuOpen ? styles.open : ""}`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={isActive(link.href) ? styles.active : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.right}>
        <form
          className={styles.search}
          role="search"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar produtos..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Buscar produtos"
          />
          <button
            type="submit"
            className={styles.searchButton}
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </form>

        <div className={styles.actions}>
          <ThemeToggle />

          <Link
            href="/favoritos"
            className={styles.action}
            aria-label={`Favoritos (${wishlistCount})`}
            onClick={closeMenu}
          >
            <HeartIcon filled={wishlistCount > 0} />
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </Link>

          <Link
            href="/carrinho"
            className={styles.action}
            aria-label={`Carrinho (${cartCount} item(s))`}
            onClick={closeMenu}
          >
            <CarrinhoIcon />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {hydrated && isAuthenticated ? (
            <div className={styles.account} ref={accountRef}>
              <button
                type="button"
                className={styles.accountButton}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Minha conta"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <PerfilIcon />
              </button>

              {accountOpen && (
                <div className={styles.dropdown} role="menu">
                  <Link
                    href="/conta"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => setAccountOpen(false)}
                  >
                    Minha conta
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                      router.push("/");
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={styles.accountLink}
              aria-label="Entrar"
              onClick={closeMenu}
            >
              <PerfilIcon />
              <span className={styles.accountName}>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
