"use client";

import { useMemo, useState } from "react";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";

// Renders an input with optional leading icon and password visibility toggle.
export default function IconInput({
  icon: Icon,
  type = "text",
  as = "input",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? "text" : "password";
  }, [isPassword, showPassword, type]);

  const baseClass =
    "w-full rounded-lg border border-[#d6d0be] bg-white py-2 text-sm outline-none ring-[#176c55] focus:ring-2";
  const leftPadding = Icon ? "pl-9" : "px-3";
  const rightPadding = isPassword ? "pr-10" : "pr-3";
  const composedClass = `${baseClass} ${leftPadding} ${rightPadding} ${className}`.trim();

  return (
    <div className="relative">
      {Icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f6c63]">
          <Icon fontSize="small" />
        </span>
      ) : null}

      {as === "textarea" ? (
        <textarea className={composedClass} {...props} />
      ) : (
        <input type={resolvedType} className={composedClass} {...props} />
      )}

      {isPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6f6c63] hover:bg-[#f1eee2]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
        </button>
      ) : null}
    </div>
  );
}
