import "./globals.css";

import Providers from "@/components/providers";

export const metadata = {
  title: "Marketplace",
  description: "A role-based marketplace UI",
  icons: {
    icon: "/marketplace-logo.svg",
    shortcut: "/marketplace-logo.svg",
    apple: "/marketplace-logo.svg",
  },
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
