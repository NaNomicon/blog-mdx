import { generateUsername } from 'unique-username-generator';

/**
 * Generate a random username matching /^[a-zA-Z0-9]{3,15}$/.
 * unique-username-generator's word list includes internal hyphens (e.g.
 * "self-confidentu"), so strip non-alphanumerics and cap at 15 chars.
 */
export function generateRandomUsername(): string {
  const raw = generateUsername('', 3, 15);
  const sanitized = raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
  return sanitized.length >= 3 ? sanitized : generateRandomUsername();
}
