/**
 * Check if the current user has the required role
 * @param {Object} user - The user object from context
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

export function requireRole(user, allowedRoles) {
  if (!hasRole(user, allowedRoles)) {
    throw new Error('Forbidden: insufficient permissions');
  }
}