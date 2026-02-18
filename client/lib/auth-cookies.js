export const ACCESS_COOKIE = "pm_access_token";
export const REFRESH_COOKIE = "pm_refresh_token";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
