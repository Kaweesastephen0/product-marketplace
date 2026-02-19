"use client";

const PRODUCT_REFRESH_KEYS = [
  ["products"],
  ["admin-stats"],
  ["business-stats"],
  ["editor-stats"],
  ["approver-stats"],
  ["admin-businesses"],
  ["businesses"],
];

const USER_REFRESH_KEYS = [
  ["business-users"],
  ["admin-stats"],
  ["business-stats"],
  ["admin-businesses"],
  ["businesses"],
];

const UNIQUE_KEY_SEPARATOR = "::";

// Invalidates active dashboard queries so cards and tables refresh after mutations.
export async function refreshDashboardData(queryClient, { products = false, users = false } = {}) {
  const keyMap = new Map();
  const keys = [
    ...(products ? PRODUCT_REFRESH_KEYS : []),
    ...(users ? USER_REFRESH_KEYS : []),
  ];

  for (const key of keys) {
    keyMap.set(key.join(UNIQUE_KEY_SEPARATOR), key);
  }

  await Promise.all(
    [...keyMap.values()].map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      }),
    ),
  );
}
