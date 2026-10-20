/**
 * Whether a session JWT is expired or within a minute of it. Reads the `exp`
 * claim without verifying — only the server can do that — so it answers "is
 * it worth sending?", not "is it valid?". Unreadable tokens count as expired.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT segments are base64url ("-"/"_", no padding); atob wants base64
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64)) as { exp?: number };
    return typeof exp !== "number" || Date.now() / 1000 > exp - 60;
  } catch {
    return true;
  }
};
