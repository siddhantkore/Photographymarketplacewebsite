/**
 * Authentication utilities
 */

/**
 * Get access token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Set access token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

/**
 * Remove access token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('accessToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
