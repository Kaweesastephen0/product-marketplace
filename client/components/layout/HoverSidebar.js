"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 250;

// Renders sidebar navigation links and logout controls.
function SidebarContent({ items, activeKey, expanded, onSelect, onLogout }) {
  return (
    <div className="flex h-full flex-col pt-4">
      <div className="overflow-hidden whitespace-nowrap px-4 pb-2 text-xs uppercase text-[#6f6c63]">
        <span
          aria-hidden={!expanded}
          className={`inline-block transition-all duration-300 ease-out content-center text-2xl text-[#176c55] font-bold ${
            expanded ? "max-w-30 translate-x-0 opacity-100" : "max-w-0 -translate-x-1 opacity-0"

          }`}
        >
          Marketplace
        </span>
      </div>

      <ul className="m-0 list-none px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = activeKey === item.key;

          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={selected ? "page" : undefined}
                className={`mb-1 flex min-h-11 w-full items-center rounded-xl border-0 bg-transparent text-[#211f1a] transition-all duration-300 ${
                  expanded ? "justify-start px-3" : "justify-center px-2"
                } ${selected ? "bg-[#176c55] text-white" : "hover:bg-[#176c55] hover:text-white"}`}
                
              >
                <span
                  className={`inline-flex items-center justify-center transition-[min-width] duration-300 ${
                    expanded ? "min-w-9.5" : "min-w-0"
                  }`}
                >
                  <Icon fontSize="small" />
                </span>
                <span
                  className={`overflow-hidden whitespace-nowrap text-left text-sm leading-5 transition-all duration-300 ${
                    expanded
                      ? "ml-0 max-w-45 translate-x-0 opacity-100"
                      : "-ml-0.5 max-w-0 -translate-x-1.5 opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto p-3">
        <Link
          href="/"
          className={`flex min-h-11 items-center rounded-xl px-2 text-[#211f1a] no-underline transition-all duration-300 hover:bg-[#f1eee2] ${
            expanded ? "justify-start px-3" : "justify-center"
          }`}
        >
          <span
            className={`overflow-hidden whitespace-nowrap text-[13px] transition-all duration-300 ${
              expanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Public Listing
          </span>
          <span
            className={`overflow-hidden text-[13px] leading-none transition-all duration-300 ${
              expanded ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            P
          </span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className={`mt-1 flex min-h-11 w-full items-center rounded-xl text-[#211f1a] transition-all duration-300 hover:bg-rose-50 hover:text-rose-700 ${
            expanded ? "justify-start px-3" : "justify-center px-2"
          }`}
        >
          <span
            className={`inline-flex items-center justify-center transition-[min-width] duration-300 ${
              expanded ? "min-w-9.5" : "min-w-0"
            }`}
          >
            <LogoutOutlined fontSize="small" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap text-left text-[13px] transition-all duration-300 ${
              expanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}

// Renders responsive sidebar navigation with hover-expand behavior.
export default function HoverSidebar({ items, activeKey, onSelect, mobileOpen, onMobileClose, onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const currentWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <>
      <div
        className="relative hidden md:block"
        style={{
          width: currentWidth,
          transition: "width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <aside
          className="fixed left-0 top-0 z-[1200] h-screen border-r border-[#ded9cb] bg-[#fffef9]"
          style={{
            width: currentWidth,
            transition: "width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <SidebarContent
            items={items}
            activeKey={activeKey}
            expanded={expanded}
            onSelect={onSelect}
            onLogout={() => setLogoutConfirmOpen(true)}
          />
        </aside>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[1300] flex bg-black/35 md:hidden"
          onClick={onMobileClose}
          role="button"
          tabIndex={-1}
        >
          <aside
            className="h-full w-[250px] border-r border-[#ded9cb] bg-[#fffef9]"
            style={{ animation: "sidebar-slide-in 220ms ease" }}
            onClick={(event) => event.stopPropagation()}
          >
            <SidebarContent
              items={items}
              activeKey={activeKey}
              expanded
              onSelect={(key) => {
                onSelect(key);
                onMobileClose();
              }}
              onLogout={() => setLogoutConfirmOpen(true)}
            />
          </aside>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes sidebar-slide-in {
          from {
            transform: translateX(-12px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        confirmTone="warning"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          onMobileClose?.();
          onLogout?.();
        }}
      />
    </>
  );
}
