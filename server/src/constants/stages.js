// ============================================
// 候选人招聘流程阶段常量
// ============================================

const CandidateStage = Object.freeze({
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  EVALUATION: 'evaluation',
  OFFER: 'offer',
  ONBOARDING: 'onboarding',
  CLOSED: 'closed'
});

const CANDIDATE_STAGE_OPTIONS = Object.freeze([
  { value: CandidateStage.SCREENING, label: '简历筛选', color: 'default' },
  { value: CandidateStage.INTERVIEW, label: '面试阶段', color: 'blue' },
  { value: CandidateStage.EVALUATION, label: '评价阶段', color: 'purple' },
  { value: CandidateStage.OFFER, label: 'Offer 阶段', color: 'cyan' },
  { value: CandidateStage.ONBOARDING, label: '待入职', color: 'green' },
  { value: CandidateStage.CLOSED, label: '已结束', color: 'default' }
]);

// ============================================
// 面试类型常量
// ============================================

const InterviewType = Object.freeze({
  PHONE: 'phone',
  VIDEO: 'video',
  ONSITE: 'onsite',
  FINAL: 'final'
});

const INTERVIEW_TYPE_VALUES = Object.freeze([
  InterviewType.PHONE,
  InterviewType.VIDEO,
  InterviewType.ONSITE,
  InterviewType.FINAL
]);

const INTERVIEW_TYPE_MAP = Object.freeze({
  [InterviewType.PHONE]: '电话面',
  [InterviewType.VIDEO]: '视频面',
  [InterviewType.ONSITE]: '现场面',
  [InterviewType.FINAL]: '终面'
});

const INTERVIEW_TYPE_OPTIONS = Object.freeze([
  { value: InterviewType.PHONE, label: '电话面', color: 'green' },
  { value: InterviewType.VIDEO, label: '视频面', color: 'blue' },
  { value: InterviewType.ONSITE, label: '现场面', color: 'cyan' },
  { value: InterviewType.FINAL, label: '终面', color: 'purple' }
]);

// ============================================
// 面试状态常量
// ============================================

const InterviewStatus = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
});

const INTERVIEW_STATUS_VALUES = Object.freeze([
  InterviewStatus.PENDING,
  InterviewStatus.COMPLETED,
  InterviewStatus.CANCELLED
]);

const INTERVIEW_STATUS_MAP = Object.freeze({
  [InterviewStatus.PENDING]: { label: '待面试', color: 'blue' },
  [InterviewStatus.COMPLETED]: { label: '已完成', color: 'green' },
  [InterviewStatus.CANCELLED]: { label: '已取消', color: 'default' }
});

// ============================================
// 评价状态常量
// ============================================

const EvaluationStatus = Object.freeze({
  PENDING: 'pending',
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  OVERDUE: 'overdue'
});

const EVALUATION_STATUS_VALUES = Object.freeze([
  EvaluationStatus.PENDING,
  EvaluationStatus.DRAFT,
  EvaluationStatus.SUBMITTED,
  EvaluationStatus.OVERDUE
]);

const INTERVIEW_EVALUATION_STATUS_VALUES = Object.freeze([
  EvaluationStatus.PENDING,
  EvaluationStatus.SUBMITTED,
  EvaluationStatus.OVERDUE
]);

const EVALUATION_STATUS_MAP = Object.freeze({
  [EvaluationStatus.PENDING]: { label: '待评价', color: 'gold' },
  [EvaluationStatus.DRAFT]: { label: '草稿中', color: 'blue' },
  [EvaluationStatus.SUBMITTED]: { label: '已评价', color: 'green' },
  [EvaluationStatus.OVERDUE]: { label: '已逾期', color: 'red' }
});

// ============================================
// 录用建议常量
// ============================================

const RecommendationType = Object.freeze({
  STRONG_HIRE: 'strong_hire',
  HIRE: 'hire',
  BORDERLINE: 'borderline',
  NO_HIRE: 'no_hire',
  PENDING: 'pending'
});

const RECOMMENDATION_VALUES = Object.freeze([
  RecommendationType.STRONG_HIRE,
  RecommendationType.HIRE,
  RecommendationType.BORDERLINE,
  RecommendationType.NO_HIRE,
  RecommendationType.PENDING
]);

const RECOMMENDATION_MAP = Object.freeze({
  [RecommendationType.STRONG_HIRE]: '强烈推荐录用',
  [RecommendationType.HIRE]: '建议录用',
  [RecommendationType.BORDERLINE]: '待定考虑',
  [RecommendationType.NO_HIRE]: '不建议录用',
  [RecommendationType.PENDING]: '待决定'
});

const RECOMMENDATION_OPTIONS = Object.freeze([
  { value: RecommendationType.STRONG_HIRE, label: '强烈推荐录用' },
  { value: RecommendationType.HIRE, label: '建议录用' },
  { value: RecommendationType.BORDERLINE, label: '待定考虑' },
  { value: RecommendationType.NO_HIRE, label: '不建议录用' },
  { value: RecommendationType.PENDING, label: '待决定' }
]);

// ============================================
// 评价维度常量
// ============================================

const DEFAULT_DIMENSIONS = Object.freeze([
  { code: 'technical_skill', name: '专业技能', score: 5, comment: '' },
  { code: 'problem_solving', name: '问题解决能力', score: 5, comment: '' },
  { code: 'communication', name: '沟通表达', score: 5, comment: '' },
  { code: 'teamwork', name: '团队协作', score: 5, comment: '' },
  { code: 'learning_ability', name: '学习能力', score: 5, comment: '' },
  { code: 'cultural_fit', name: '文化匹配', score: 5, comment: '' }
]);

const DEFAULT_DIMENSIONS_META = Object.freeze([
  { code: 'technical_skill', name: '专业技能' },
  { code: 'problem_solving', name: '问题解决能力' },
  { code: 'communication', name: '沟通表达' },
  { code: 'teamwork', name: '团队协作' },
  { code: 'learning_ability', name: '学习能力' },
  { code: 'cultural_fit', name: '文化匹配' }
]);

// ============================================
// Offer 状态常量
// ============================================

const OfferStatus = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn'
});

const OFFER_STATUS_VALUES = Object.freeze([
  OfferStatus.DRAFT,
  OfferStatus.PENDING_APPROVAL,
  OfferStatus.APPROVED,
  OfferStatus.REJECTED,
  OfferStatus.SENT,
  OfferStatus.ACCEPTED,
  OfferStatus.DECLINED,
  OfferStatus.WITHDRAWN
]);

const OFFER_STATUS_MAP = Object.freeze({
  [OfferStatus.DRAFT]: { label: '草稿', color: 'default' },
  [OfferStatus.PENDING_APPROVAL]: { label: '审批中', color: 'gold' },
  [OfferStatus.APPROVED]: { label: '审批通过', color: 'green' },
  [OfferStatus.REJECTED]: { label: '审批驳回', color: 'red' },
  [OfferStatus.SENT]: { label: '已发出', color: 'blue' },
  [OfferStatus.ACCEPTED]: { label: '已接受', color: 'green' },
  [OfferStatus.DECLINED]: { label: '候选人拒绝', color: 'orange' },
  [OfferStatus.WITHDRAWN]: { label: '已撤回', color: 'default' }
});

// ============================================
// Offer 审批动作常量
// ============================================

const OfferAction = Object.freeze({
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  ROLLBACK: 'rollback',
  SEND: 'send',
  ACCEPT: 'accept',
  DECLINE: 'decline',
  WITHDRAW: 'withdraw',
  EDIT: 'edit'
});

const ApprovalAction = Object.freeze({
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  WITHDRAW: 'withdraw',
  RESUBMIT: 'resubmit',
  SEND: 'send',
  ACCEPT: 'accept',
  DECLINE: 'decline'
});

const APPROVAL_ACTION_VALUES = Object.freeze([
  ApprovalAction.SUBMIT,
  ApprovalAction.APPROVE,
  ApprovalAction.REJECT,
  ApprovalAction.WITHDRAW,
  ApprovalAction.RESUBMIT,
  ApprovalAction.SEND,
  ApprovalAction.ACCEPT,
  ApprovalAction.DECLINE
]);

// ============================================
// 沟通记录常量
// ============================================

const CommunicationType = Object.freeze({
  EMAIL: 'email',
  PHONE: 'phone',
  ONSITE: 'onsite',
  VIDEO: 'video',
  NOTE: 'note',
  SYSTEM: 'system'
});

const COMMUNICATION_TYPE_VALUES = Object.freeze([
  CommunicationType.EMAIL,
  CommunicationType.PHONE,
  CommunicationType.ONSITE,
  CommunicationType.VIDEO,
  CommunicationType.NOTE,
  CommunicationType.SYSTEM
]);

const COMMUNICATION_TYPE_OPTIONS = Object.freeze([
  { value: CommunicationType.EMAIL, label: '邮件', color: 'blue', icon: 'mail' },
  { value: CommunicationType.PHONE, label: '电话', color: 'green', icon: 'phone' },
  { value: CommunicationType.ONSITE, label: '现场', color: 'purple', icon: 'home' },
  { value: CommunicationType.VIDEO, label: '视频', color: 'cyan', icon: 'video-camera' },
  { value: CommunicationType.NOTE, label: '备注', color: 'orange', icon: 'file-text' },
  { value: CommunicationType.SYSTEM, label: '系统', color: 'default', icon: 'setting' }
]);

const CommunicationDirection = Object.freeze({
  OUTBOUND: 'outbound',
  INBOUND: 'inbound',
  INTERNAL: 'internal'
});

const COMMUNICATION_DIRECTION_VALUES = Object.freeze([
  CommunicationDirection.OUTBOUND,
  CommunicationDirection.INBOUND,
  CommunicationDirection.INTERNAL
]);

const DIRECTION_OPTIONS = Object.freeze([
  { value: CommunicationDirection.OUTBOUND, label: '主动联系', color: 'blue' },
  { value: CommunicationDirection.INBOUND, label: '候选人来电', color: 'green' },
  { value: CommunicationDirection.INTERNAL, label: '内部沟通', color: 'orange' }
]);

// ============================================
// 录用形式常量
// ============================================

const EmploymentType = Object.freeze({
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern'
});

const EMPLOYMENT_TYPE_VALUES = Object.freeze([
  EmploymentType.FULL_TIME,
  EmploymentType.PART_TIME,
  EmploymentType.CONTRACT,
  EmploymentType.INTERN
]);

const EMPLOYMENT_TYPE_OPTIONS = Object.freeze([
  { label: '全职', value: EmploymentType.FULL_TIME },
  { label: '兼职', value: EmploymentType.PART_TIME },
  { label: '外包', value: EmploymentType.CONTRACT },
  { label: '实习', value: EmploymentType.INTERN }
]);

// ============================================
// 催办相关常量
// ============================================

const ReminderType = Object.freeze({
  EVALUATION: 'evaluation'
});

const ReminderStatus = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed'
});

const ReminderChannel = Object.freeze({
  EMAIL: 'email'
});

// ============================================
// 部门常量
// ============================================

const Department = Object.freeze({
  TECH: '技术部',
  PRODUCT: '产品部',
  DESIGN: '设计部',
  OPERATION: '运营部'
});

const DEPARTMENT_OPTIONS = Object.freeze([
  { label: '技术部', value: Department.TECH },
  { label: '产品部', value: Department.PRODUCT },
  { label: '设计部', value: Department.DESIGN },
  { label: '运营部', value: Department.OPERATION }
]);

module.exports = {
  CandidateStage,
  CANDIDATE_STAGE_OPTIONS,
  InterviewType,
  INTERVIEW_TYPE_VALUES,
  INTERVIEW_TYPE_MAP,
  INTERVIEW_TYPE_OPTIONS,
  InterviewStatus,
  INTERVIEW_STATUS_VALUES,
  INTERVIEW_STATUS_MAP,
  EvaluationStatus,
  EVALUATION_STATUS_VALUES,
  INTERVIEW_EVALUATION_STATUS_VALUES,
  EVALUATION_STATUS_MAP,
  RecommendationType,
  RECOMMENDATION_VALUES,
  RECOMMENDATION_MAP,
  RECOMMENDATION_OPTIONS,
  DEFAULT_DIMENSIONS,
  DEFAULT_DIMENSIONS_META,
  OfferStatus,
  OFFER_STATUS_VALUES,
  OFFER_STATUS_MAP,
  OfferAction,
  ApprovalAction,
  APPROVAL_ACTION_VALUES,
  CommunicationType,
  COMMUNICATION_TYPE_VALUES,
  COMMUNICATION_TYPE_OPTIONS,
  CommunicationDirection,
  COMMUNICATION_DIRECTION_VALUES,
  DIRECTION_OPTIONS,
  EmploymentType,
  EMPLOYMENT_TYPE_VALUES,
  EMPLOYMENT_TYPE_OPTIONS,
  ReminderType,
  ReminderStatus,
  ReminderChannel,
  Department,
  DEPARTMENT_OPTIONS
};
