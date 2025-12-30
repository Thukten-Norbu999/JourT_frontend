export const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export function oauthStart(provider) {
  // provider: "google" | "github"
  window.location.href = `${BACKEND}/auth/${provider}/start`;
}
