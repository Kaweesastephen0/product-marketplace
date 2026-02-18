import "./globals.css";

import Providers from "@/components/providers";

export const metadata = {
  title: "Product Marketplace",
  description: "Professional role-based marketplace UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
