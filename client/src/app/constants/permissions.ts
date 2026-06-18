// ============================================
// 用户角色枚举
// ============================================

export enum UserRole {
  HR = 'hr',
  INTERVIEWER = 'interviewer',
  ADMIN = 'admin'
}

export type UserRoleType = UserRole.HR | UserRole.INTERVIEWER | UserRole.ADMIN;

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string; color: string }> = [
  { value: UserRole.HR, label: 'HR', color: 'blue' },
  { value: UserRole.INTERVIEWER, label: '面试官', color: 'purple' },
  { value: UserRole.ADMIN, label: '管理员', color: 'red' }
];

export const USER_ROLE_LABEL_MAP: Record<UserRole, string> = {
  [UserRole.HR]: 'HR',
  [UserRole.INTERVIEWER]: '面试官',
  [UserRole.ADMIN]: '管理员'
};

export type OperatorRole = UserRoleType;

export const OPERATOR_ROLE_OPTIONS = USER_ROLE_OPTIONS;

// ============================================
// 权限资源枚举
// ============================================

export enum PermissionResource {
  CANDIDATE = 'candidate',
  INTERVIEW = 'interview',
  EVALUATION = 'evaluation',
  OFFER = 'offer',
  REMINDER = 'reminder',
  COMMUNICATION = 'communication',
  SCHEDULE_CONFLICT = 'schedule_conflict',
  FOLLOW_UP = 'follow_up',
  FOLLOW_UP_TEMPLATE = 'follow_up_template'
}

// ============================================
// 权限操作枚举
// ============================================

export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  SEND = 'send',
  REMIND = 'remind',
  EXPORT = 'export'
}

// ============================================
// 权限矩阵定义
// ============================================

export interface PermissionDefinition {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionDefinition[]> = {
  [UserRole.HR]: [
    {
      resource: PermissionResource.CANDIDATE,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.EXPORT
      ]
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: [PermissionAction.VIEW]
    },
    {
      resource: PermissionResource.OFFER,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.SUBMIT,
        PermissionAction.SEND,
        PermissionAction.WITHDRAW
      ] as PermissionAction[]
    },
    {
      resource: PermissionResource.REMINDER,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.REMIND,
        PermissionAction.EXPORT
      ]
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    },
    {
      resource: PermissionResource.SCHEDULE_CONFLICT,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.EDIT,
        PermissionAction.REMIND
      ] as PermissionAction[]
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SEND
      ]
    },
    {
      resource: PermissionResource.FOLLOW_UP_TEMPLATE,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    }
  ],

  [UserRole.INTERVIEWER]: [
    {
      resource: PermissionResource.CANDIDATE,
      actions: [PermissionAction.VIEW]
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: [PermissionAction.VIEW]
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.SUBMIT
      ]
    },
    {
      resource: PermissionResource.OFFER,
      actions: [PermissionAction.VIEW]
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT
      ]
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: [PermissionAction.VIEW]
    }
  ],

  [UserRole.ADMIN]: [
    {
      resource: PermissionResource.CANDIDATE,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.EXPORT
      ]
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SUBMIT,
        PermissionAction.EXPORT
      ]
    },
    {
      resource: PermissionResource.OFFER,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SUBMIT,
        PermissionAction.APPROVE,
        PermissionAction.REJECT,
        PermissionAction.SEND,
        PermissionAction.WITHDRAW
      ] as PermissionAction[]
    },
    {
      resource: PermissionResource.REMINDER,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.REMIND,
        PermissionAction.EXPORT
      ]
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    },
    {
      resource: PermissionResource.SCHEDULE_CONFLICT,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.REMIND
      ] as PermissionAction[]
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SEND
      ]
    },
    {
      resource: PermissionResource.FOLLOW_UP_TEMPLATE,
      actions: [
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ]
    }
  ]
};

// ============================================
// 权限判断工具函数
// ============================================

export function hasPermission(
  role: UserRole | string | undefined | null,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;

  const resourcePerm = permissions.find(p => p.resource === resource);
  if (!resourcePerm) return false;

  return resourcePerm.actions.includes(action);
}

export function hasAnyPermission(
  role: UserRole | string | undefined | null,
  resource: PermissionResource,
  actions: PermissionAction[]
): boolean {
  return actions.some(action => hasPermission(role, resource, action));
}

export function getAllowedActions(
  role: UserRole | string | undefined | null,
  resource: PermissionResource
): PermissionAction[] {
  if (!role) return [];

  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return [];

  const resourcePerm = permissions.find(p => p.resource === resource);
  return resourcePerm ? resourcePerm.actions : [];
}
