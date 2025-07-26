// utils/permissions.js
export const checkUserPermissions = (userRole, adminRoles, requiredPermission) => {
    if (!userRole || !adminRoles || adminRoles.length === 0) {
      return false;
    }
    
    const userRoleData = adminRoles.find(role => role.name === userRole || role.id === userRole);
    return userRoleData?.permissions?.includes(requiredPermission) || false;
  };
  
  export const getUserPermissions = (userRole, adminRoles) => {
    if (!userRole || !adminRoles || adminRoles.length === 0) {
      return [];
    }
    
    const userRoleData = adminRoles.find(role => role.name === userRole || role.id === userRole);
    return userRoleData?.permissions || [];
  };