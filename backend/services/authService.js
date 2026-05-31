/**
 * Auth business logic service stub.
 */
export function isStrongPassword(password) {
  return password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}
