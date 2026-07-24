// Signup pledge credit: the first N patrons to make a profile get this much
// credit to pledge with (no card needed).
export const SIGNUP_CREDIT_CENTS = 25_00;
export const MAX_SIGNUP_CREDITS = 100;

// Founder grants: these accounts get a fixed credit the first time they make
// a profile — instead of the standard signup credit, and without using up one
// of the first-100 slots. Keyed by lowercased email.
export const FOUNDER_CREDIT_CENTS: Record<string, number> = {
  "carol@manifund.org": 4000_00,
  "austin@manifund.org": 4000_00,
};
