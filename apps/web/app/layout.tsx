import type { ReactNode } from "react";
import "ui/styles.css";

export const metadata = { title: "Zenbit Sandbox" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
