"use client";

import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PendingActionsOutlined from "@mui/icons-material/PendingActionsOutlined";
import QueryStatsOutlined from "@mui/icons-material/QueryStatsOutlined";

// Returns metric icon data.
function getMetricIcon(label) {
  if (label.includes("Businesses")) return ApartmentOutlined;
  if (label.includes("Users")) return GroupsOutlined;
  if (label.includes("Pending")) return PendingActionsOutlined;
  if (label.includes("Approved")) return CheckCircleOutline;
  if (label.includes("Products")) return Inventory2Outlined;
  return QueryStatsOutlined;
}

// Renders a responsive grid of metric summary cards.
export default function MetricCards({ items }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {items.map((item) => {
        const Icon = getMetricIcon(item.label);
        return (
          <article key={item.label} className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="m-0 text-xs text-[#6f6c63]">{item.label}</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1eee2] text-[#176c55]">
                <Icon fontSize="small" />
              </span>
            </div>
            <p className="m-0 mt-1 text-2xl font-bold text-[#211f1a]">{item.value}</p>
          </article>
        );
      })}
    </div>
  );
}
