/**
 * Validation utilities
 */

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return (
    password &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#22c55e' },
    { label: 'Strong', color: '#10b981' },
  ];

  return { score, ...levels[Math.min(score, levels.length) - 1] || levels[0] };
}

export function isNotEmpty(value) {
  return value != null && String(value).trim().length > 0;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export function validateRegisterForm({ name, email, password }) {
  const errors = {};
  if (!isNotEmpty(name)) errors.name = 'Name is required';
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email';
  if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number';
  }
  return errors;
}
