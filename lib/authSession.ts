export const AUTH_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const AUTH_SESSION_MAX_AGE_MS = AUTH_SESSION_MAX_AGE_SECONDS * 1000;
export const AUTH_ACTIVITY_COOKIE = "mobronix_last_activity";

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
};
