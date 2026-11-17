export const AVAILABLE_PERMISSIONS = [
  { key: 'users:read', label: 'View Users', group: 'Users' },
  { key: 'users:write', label: 'Create & Edit Users', group: 'Users' },
  { key: 'users:delete', label: 'Delete Users', group: 'Users' },

  { key: 'roles:read', label: 'View Roles & Permissions', group: 'Roles' },
  { key: 'roles:write', label: 'Create & Edit Roles', group: 'Roles' },
  { key: 'roles:delete', label: 'Delete Custom Roles', group: 'Roles' },

  { key: 'records:read', label: 'View Projects/Records', group: 'Records' },
  { key: 'records:write', label: 'Create & Edit Records', group: 'Records' },
  { key: 'records:delete', label: 'Delete Records', group: 'Records' },
];

export const ALL_PERMISSION_KEYS = AVAILABLE_PERMISSIONS.map(p => p.key);

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: ALL_PERMISSION_KEYS,
  manager: [
    'users:read',
    'records:read',
    'records:write',
    'records:delete',
  ],
  user: [
    'records:read',
    'records:write',
  ],
};

