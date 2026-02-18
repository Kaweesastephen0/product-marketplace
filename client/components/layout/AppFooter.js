"use client";

export default function AppFooter({ compact = false }) {
  return (
    <footer
      className={`border-t border-[#ded9cb] bg-[#fffef9] px-4 ${compact ? "py-2" : "py-2.5"}`}
    >
      <p className="m-0 text-center text-xs leading-[1.4] text-[#6f6c63]">
        CopyRight &copy; {new Date().getFullYear()} - Product Marketplace Platform
      </p>
    </footer>
  );
}
