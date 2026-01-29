import { DataHubPermissions } from '@/types/dataHub';

export function checkDataHubAccess(userRole?: string): DataHubPermissions {
  switch (userRole) {
    case 'admin':
      return {
        canView: true,
        canImport: true,
        canDelete: true,
        canExport: true,
        canManageMappings: true,
      };
    case 'gestor':
      return {
        canView: true,
        canImport: true,
        canDelete: false,
        canExport: true,
        canManageMappings: true,
      };
    case 'analista':
      return {
        canView: true,
        canImport: true,
        canDelete: false,
        canExport: true,
        canManageMappings: false,
      };
    case 'visualizador':
      return {
        canView: true,
        canImport: false,
        canDelete: false,
        canExport: false,
        canManageMappings: false,
      };
    default:
      // Default to admin for now (since mock auth uses 'admin' role)
      return {
        canView: true,
        canImport: true,
        canDelete: true,
        canExport: true,
        canManageMappings: true,
      };
  }
}
