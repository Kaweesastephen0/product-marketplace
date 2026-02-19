"use client";

import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

// Renders the dashboard header, profile menu, and quick actions.
export default function AppHeader({ title, subtitle, user, onOpenSidebar, onLogout, onOpenProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[1100] border-b border-[#ded9cb] bg-[#fffef9]/90 backdrop-blur">
      <div className="flex min-h-[70px] items-center gap-2 px-3 sm:px-4">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#211f1a] hover:bg-[#f1eee2] md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <MenuIcon fontSize="medium" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-lg font-bold text-[#211f1a]">{title}</h1>
          {subtitle ? <p className="m-0 truncate text-xs text-[#6f6c63]">{subtitle}</p> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[#211f1a] hover:bg-[#f1eee2]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#176c55] text-xs font-semibold text-white">
              {(user?.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm leading-tight">{user?.email || "User"}</span>
              <span className="block text-xs capitalize leading-tight text-[#6f6c63]">{user?.role || "role"}</span>
            </span>
            <ExpandMoreIcon fontSize="medium" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-[1200] min-w-44 rounded-xl border border-[#ded9cb] bg-white p-1 shadow-lg">
              <div className="rounded-lg px-3 py-2 text-xs text-[#6f6c63]">{user?.email}</div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfile?.();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#211f1a] hover:bg-[#f5f4ef]"
              >
                <PersonOutlineOutlined fontSize="medium" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#211f1a] hover:bg-[#f5f4ef]"
              >
                <LogoutOutlined fontSize="medium" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
