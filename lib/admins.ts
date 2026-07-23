// Who can review blog nominations. Checked server-side in the nomination API
// routes (against the token-verified user's email) and client-side to show or
// hide the admin UI. The server check is the real gate.
export const ADMIN_EMAILS = ["carol@manifund.org", "austin@manifund.org"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
