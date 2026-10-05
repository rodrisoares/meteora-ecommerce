import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Roda antes do React montar: aplica o tema salvo (ou o do sistema) no <html>
// para não haver flash de tela clara ao carregar no modo escuro.
const themeInitScript = `(function(){try{var t=localStorage.getItem("meteora:theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

const inter = Inter({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Base para resolver URLs absolutas (OpenGraph/Twitter). Em produção defina
// NEXT_PUBLIC_SITE_URL (ex.: https://meteora.com.br); no dev cai para localhost.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Meteora | Loja de Roupas",
  description: "O melhor e-commerce do planeta e região.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header />
                  {children}
                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
