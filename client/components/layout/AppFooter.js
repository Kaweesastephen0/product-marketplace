"use client";

export default function AppFooter({ compact = false }) {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid #ded9cb",
        background: "#fffef9",
        padding: compact ? "8px 16px" : "10px 16px",
        zIndex: 1200,
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          color: "#6f6c63",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        CopyRight &copy; {new Date().getFullYear()} - Product Marketplace Platform
      </p>
    </footer>
  );
}
