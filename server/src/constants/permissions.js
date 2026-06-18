// ============================================
// 用户角色常量
// ============================================

const UserRole = Object.freeze({
  HR: 'hr',
  INTERVIEWER: 'interviewer',
  ADMIN: 'admin'
});

const USER_ROLE_VALUES = Object.freeze([
  UserRole.HR,
  UserRole.INTERVIEWER,
  UserRole.ADMIN
]);

const USER_ROLE_OPTIONS = Object.freeze([
  { value: UserRole.HR, label: 'HR', color: 'blue' },
  { value: UserRole.INTERVIEWER, label: '面试官', color: 'purple' },
  { value: UserRole.ADMIN, label: '管理员', color: 'red' }
]);

const USER_ROLE_LABEL_MAP = Object.freeze({
  [UserRole.HR]: 'HR',
  [UserRole.INTERVIEWER]: '面试官',
  [UserRole.ADMIN]: '管理员'
});

const OperatorRole = UserRole;
const OPERATOR_ROLE_VALUES = USER_ROLE_VALUES;
const OPERATOR_ROLE_OPTIONS = USER_ROLE_OPTIONS;

// ============================================
// 权限资源常量
// ============================================

const PermissionResource = Object.freeze({
  CANDIDATE: 'candidate',
  INTERVIEW: 'interview',
  EVALUATION: 'evaluation',
  OFFER: 'offer',
  REMINDER: 'reminder',
  COMMUNICATION: 'communication',
  SCHEDULE_CONFLICT: 'schedule_conflict',
  FOLLOW_UP: 'follow_up',
  FOLLOW_UP_TEMPLATE: 'follow_up_template'
});

// ============================================
// 权限操作常量
// ============================================

const PermissionAction = Object.freeze({
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  SEND: 'send',
  REMIND: 'remind',
  EXPORT: 'export',
  WITHDRAW: 'withdraw'
});

// ============================================
// 权限矩阵定义
// ============================================

const ROLE_PERMISSIONS = Object.freeze({
  [UserRole.HR]: Object.freeze([
    {
      resource: PermissionResource.CANDIDATE,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.EXPORT
      ])
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: Object.freeze([PermissionAction.VIEW])
    },
    {
      resource: PermissionResource.OFFER,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.SUBMIT,
        PermissionAction.SEND,
        PermissionAction.WITHDRAW
      ])
    },
    {
      resource: PermissionResource.REMINDER,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.REMIND,
        PermissionAction.EXPORT
      ])
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    },
    {
      resource: PermissionResource.SCHEDULE_CONFLICT,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.EDIT,
        PermissionAction.REMIND
      ])
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SEND
      ])
    },
    {
      resource: PermissionResource.FOLLOW_UP_TEMPLATE,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    }
  ]),

  [UserRole.INTERVIEWER]: Object.freeze([
    {
      resource: PermissionResource.CANDIDATE,
      actions: Object.freeze([PermissionAction.VIEW])
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: Object.freeze([PermissionAction.VIEW])
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.SUBMIT
      ])
    },
    {
      resource: PermissionResource.OFFER,
      actions: Object.freeze([PermissionAction.VIEW])
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT
      ])
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: Object.freeze([PermissionAction.VIEW])
    }
  ]),

  [UserRole.ADMIN]: Object.freeze([
    {
      resource: PermissionResource.CANDIDATE,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.EXPORT
      ])
    },
    {
      resource: PermissionResource.INTERVIEW,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    },
    {
      resource: PermissionResource.EVALUATION,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SUBMIT,
        PermissionAction.EXPORT
      ])
    },
    {
      resource: PermissionResource.OFFER,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SUBMIT,
        PermissionAction.APPROVE,
        PermissionAction.REJECT,
        PermissionAction.SEND,
        PermissionAction.WITHDRAW
      ])
    },
    {
      resource: PermissionResource.REMINDER,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.REMIND,
        PermissionAction.EXPORT
      ])
    },
    {
      resource: PermissionResource.COMMUNICATION,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    },
    {
      resource: PermissionResource.SCHEDULE_CONFLICT,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.REMIND
      ])
    },
    {
      resource: PermissionResource.FOLLOW_UP,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE,
        PermissionAction.SEND
      ])
    },
    {
      resource: PermissionResource.FOLLOW_UP_TEMPLATE,
      actions: Object.freeze([
        PermissionAction.VIEW,
        PermissionAction.CREATE,
        PermissionAction.EDIT,
        PermissionAction.DELETE
      ])
    }
  ])
});

// ============================================
// 权限判断工具函数
// ============================================

function hasPermission(role, resource, action) {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePerm = permissions.find(p => p.resource === resource);
  if (!resourcePerm) return false;

  return resourcePerm.actions.includes(action);
}

function hasAnyPermission(role, resource, actions) {
  return actions.some(action => hasPermission(role, resource, action));
}

function getAllowedActions(role, resource) {
  if (!role) return [];

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];

  const resourcePerm = permissions.find(p => p.resource === resource);
  return resourcePerm ? resourcePerm.actions : [];
}

module.exports = {
  UserRole,
  USER_ROLE_VALUES,
  USER_ROLE_OPTIONS,
  USER_ROLE_LABEL_MAP,
  OperatorRole,
  OPERATOR_ROLE_VALUES,
  OPERATOR_ROLE_OPTIONS,
  PermissionResource,
  PermissionAction,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  getAllowedActions
};
