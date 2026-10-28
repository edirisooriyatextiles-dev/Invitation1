import "./globals.css";

export const metadata = {
  title: "Edirisooriya Textiles: Grand Opening",
  description: "Join us for our grand opening. Edirisooriya Textiles: fibres, fabrics, fashion.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0920",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
