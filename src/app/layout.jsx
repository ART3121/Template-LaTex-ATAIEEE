import "./globals.css";

export const metadata = {
  title: "Atas IEEE",
  description: "Gerador web de atas IEEE com templates LaTeX por sociedade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
